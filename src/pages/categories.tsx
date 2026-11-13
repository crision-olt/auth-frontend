import { useLingui } from '@lingui/react/macro'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/require-auth'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCategory, createSubcategory, listCategories, listSubcategories, ProductsApiError } from '@/lib/products-api'
import { buildLinkWithRedirect } from '@/lib/redirect'

function CategoriesContent() {
  const { t } = useLingui()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [categoryName, setCategoryName] = useState('')
  const [subcategoryName, setSubcategoryName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const categories = useQuery({ queryKey: ['product-categories'], queryFn: listCategories, retry: false })
  const subcategories = useQuery({ queryKey: ['product-subcategories'], queryFn: () => listSubcategories(), retry: false })
  const categoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      setCategoryName('')
      await queryClient.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
  const subcategoryMutation = useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId: number }) => createSubcategory(name, parentId),
    onSuccess: async () => {
      setSubcategoryName('')
      await queryClient.invalidateQueries({ queryKey: ['product-subcategories'] })
    },
  })

  const errors = [categories.error, subcategories.error, categoryMutation.error, subcategoryMutation.error]
  if (errors.some((error) => error instanceof ProductsApiError && error.status === 401)) {
    return <Navigate to={buildLinkWithRedirect('/login', location.pathname + location.search)} replace />
  }

  const submitCategory = (event: FormEvent) => {
    event.preventDefault()
    if (categoryName.trim()) categoryMutation.mutate(categoryName.trim())
  }
  const submitSubcategory = (event: FormEvent) => {
    event.preventDefault()
    if (subcategoryName.trim() && categoryId) {
      subcategoryMutation.mutate({ name: subcategoryName.trim(), parentId: Number(categoryId) })
    }
  }

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 sm:px-6">
          <Link to="/products" className="font-semibold">{t`Store`}</Link>
          <div className="flex items-center gap-2"><ThemeToggle /><LanguageSwitcher /></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <Link to="/products" className="text-sm underline underline-offset-4">{t`Back to products`}</Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t`Manage categories`}</h1>
          <p className="text-sm text-muted-foreground">{t`Create categories and assign subcategories to them.`}</p>
        </div>
        {(categories.isError || subcategories.isError) && (
          <p role="alert" className="text-sm text-destructive">{t`Could not load categories. Please try again.`}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{t`Create category`}</CardTitle></CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={submitCategory}>
                <Label htmlFor="category-name">{t`Category name`}</Label>
                <Input id="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} maxLength={100} required />
                {categoryMutation.isError && <p role="alert" className="text-sm text-destructive">
                  {categoryMutation.error instanceof ProductsApiError && categoryMutation.error.status === 409
                    ? t`This category already exists.` : t`Could not create category. Please try again.`}
                </p>}
                <Button type="submit" disabled={!categoryName.trim() || categoryMutation.isPending}>{t`Create category`}</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t`Create subcategory`}</CardTitle></CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={submitSubcategory}>
                <Label htmlFor="subcategory-category">{t`Category`}</Label>
                <Select value={categoryId || null} onValueChange={(value) => setCategoryId(value ?? '')}>
                  <SelectTrigger id="subcategory-category" className="w-full">
                    <SelectValue>{categories.data?.find((category) => String(category.id) === categoryId)?.name ?? t`Select a category`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.data?.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Label htmlFor="subcategory-name">{t`Subcategory name`}</Label>
                <Input id="subcategory-name" value={subcategoryName} onChange={(event) => setSubcategoryName(event.target.value)} maxLength={100} required />
                {subcategoryMutation.isError && <p role="alert" className="text-sm text-destructive">
                  {subcategoryMutation.error instanceof ProductsApiError && subcategoryMutation.error.status === 409
                    ? t`This subcategory already exists in the selected category.` : t`Could not create subcategory. Please try again.`}
                </p>}
                <Button type="submit" disabled={!subcategoryName.trim() || !categoryId || subcategoryMutation.isPending}>{t`Create subcategory`}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>{t`Categories`}</CardTitle></CardHeader>
          <CardContent>
            {categories.isPending ? <p>{t`Loading categories…`}</p> : categories.data?.length === 0 ? (
              <p className="text-muted-foreground">{t`No categories yet.`}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {categories.data?.map((category) => (
                  <li key={category.id}>
                    <p className="font-medium">{category.name}</p>
                    {subcategories.data && <p className="text-sm text-muted-foreground">
                      {subcategories.data.filter((item) => item.categoryId === category.id).map((item) => item.name).join(', ') || t`No subcategories yet.`}
                    </p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export function CategoriesPage() {
  return <RequireAuth><CategoriesContent /></RequireAuth>
}
