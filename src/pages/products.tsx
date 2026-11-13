import { useLingui } from '@lingui/react/macro'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/require-auth'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductsFilters } from '@/components/products/products-filters'
import { ProductsTable } from '@/components/products/products-table'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { logout } from '@/lib/auth-api'
import { emptyFilters, hasInvalidPriceRange, toProductsQuery, type ProductFilterValues } from '@/lib/product-filters'
import {
  listCategories,
  listProducts,
  listSubcategories,
  ProductsApiError,
  type ProductsQuery,
  type SortableColumn,
} from '@/lib/products-api'
import { buildLinkWithRedirect } from '@/lib/redirect'

const SEARCH_DEBOUNCE_MS = 300

function ProductsContent() {
  const { t } = useLingui()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ProductFilterValues>(emptyFilters)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const appliedFilters = useDebouncedValue(filters, SEARCH_DEBOUNCE_MS)
  const sort = sorting[0]
  const query: ProductsQuery = {
    ...toProductsQuery(appliedFilters),
    sortBy: sort?.id as SortableColumn | undefined,
    sortOrder: sort?.desc ? 'desc' : 'asc',
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  }

  const products = useQuery({
    queryKey: ['products', query],
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData,
    retry: false,
    enabled: !hasInvalidPriceRange(appliedFilters),
  })
  const categories = useQuery({
    queryKey: ['product-categories'],
    queryFn: listCategories,
    retry: false,
  })
  const subcategories = useQuery({
    queryKey: ['product-subcategories', filters.category],
    queryFn: () => listSubcategories(filters.category || undefined),
    retry: false,
  })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  const resetPage = () => setPagination((current) => ({ ...current, pageIndex: 0 }))

  if (products.error instanceof ProductsApiError && products.error.status === 401) {
    return <Navigate to={buildLinkWithRedirect('/login', location.pathname + location.search)} replace />
  }

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 sm:px-6">
          <span className="font-semibold">{t`Store`}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="outline" disabled={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
              {t`Sign out`}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t`Products`}</h1>
          <p className="text-sm text-muted-foreground">{t`Browse and filter the product catalog.`}</p>
          <Link className="text-sm underline underline-offset-4" to="/categories">{t`Manage categories`}</Link>
          {logoutMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {t`Could not sign out. Please try again.`}
            </p>
          )}
        </div>

        <Card>
          <CardContent>
            <ProductsFilters
              filters={filters}
              categories={categories.data ?? []}
              subcategories={subcategories.data ?? []}
              onChange={(next) => {
                setFilters(next)
                resetPage()
              }}
            />
          </CardContent>
        </Card>

        {(categories.isError || subcategories.isError) && (
          <p role="alert" className="text-sm text-destructive">{t`Could not load categories. Please try again.`}</p>
        )}

        {products.isError && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <span>{t`Could not load products. Please try again.`}</span>
            <Button variant="outline" size="sm" onClick={() => products.refetch()}>
              {t`Try again`}
            </Button>
          </div>
        )}

        <ProductsTable
          products={products.data?.data}
          total={products.data?.total ?? 0}
          isLoading={products.isPending && !products.isError}
          isFetching={products.isFetching}
          sorting={sorting}
          onSortingChange={(updater) => {
            setSorting(updater)
            resetPage()
          }}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </main>
  )
}

export function ProductsPage() {
  return (
    <RequireAuth>
      <ProductsContent />
    </RequireAuth>
  )
}
