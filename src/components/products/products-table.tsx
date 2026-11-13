import { Trans, useLingui } from '@lingui/react/macro'
import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products-api'

const features = tableFeatures({ rowSortingFeature, rowPaginationFeature })
const columnHelper = createColumnHelper<typeof features, Product>()
const emptyProducts: Product[] = []

const PAGE_SIZES = [10, 25, 50]
const NUMERIC_COLUMNS = new Set(['price', 'stock'])

const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: () => <Trans>Name</Trans>,
    cell: ({ cell, row }) => (
      <div className="flex min-w-48 flex-col">
        <span className="font-medium">{cell.getValue()}</span>
        {row.original.description && (
          <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.description}</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('sku', {
    header: () => <Trans>SKU</Trans>,
    cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue()}</span>,
  }),
  columnHelper.accessor('categoryName', {
    id: 'category',
    header: () => <Trans>Category</Trans>,
    cell: ({ cell }) => <Badge variant="secondary">{cell.getValue()}</Badge>,
  }),
  columnHelper.accessor('subcategoryName', {
    id: 'subcategory',
    header: () => <Trans>Subcategory</Trans>,
    cell: ({ cell }) => cell.getValue() ?? <span className="text-muted-foreground">—</span>,
  }),
  columnHelper.accessor('price', {
    header: () => <Trans>Price</Trans>,
    cell: ({ cell }) => <PriceCell value={cell.getValue()} />,
  }),
  columnHelper.accessor('stock', {
    header: () => <Trans>Stock</Trans>,
    cell: ({ cell }) => <StockCell value={cell.getValue()} />,
  }),
  columnHelper.accessor('created_at', {
    header: () => <Trans>Created</Trans>,
    cell: ({ cell }) => <DateCell value={cell.getValue()} />,
  }),
])

function PriceCell({ value }: { value: number }) {
  const { i18n } = useLingui()
  return new Intl.NumberFormat(i18n.locale, { style: 'currency', currency: 'USD' }).format(value)
}

function DateCell({ value }: { value: string }) {
  const { i18n } = useLingui()
  return new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'medium' }).format(new Date(value))
}

function StockCell({ value }: { value: number }) {
  const { t } = useLingui()
  return value === 0 ? <Badge variant="destructive">{t`Out of stock`}</Badge> : value
}

type Props = {
  products: Product[] | undefined
  total: number
  isLoading: boolean
  isFetching: boolean
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export function ProductsTable({
  products,
  total,
  isLoading,
  isFetching,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
}: Props) {
  const { t } = useLingui()

  const table = useTable({
    features,
    columns,
    data: products ?? emptyProducts,
    rowCount: total,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    state: { sorting, pagination },
    onSortingChange,
    onPaginationChange,
  })

  const { pageIndex, pageSize } = table.state.pagination
  const firstRow = total === 0 ? 0 : pageIndex * pageSize + 1
  const lastRow = Math.min((pageIndex + 1) * pageSize, total)
  const page = pageIndex + 1
  const pageCount = Math.max(table.getPageCount(), 1)
  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('rounded-lg border bg-card transition-opacity', isFetching && !isLoading && 'opacity-60')}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const numeric = NUMERIC_COLUMNS.has(header.column.id)
                  return (
                    <TableHead
                      key={header.id}
                      className={numeric ? 'text-right' : undefined}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn('-mx-2', numeric && 'flex-row-reverse')}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        {sorted === 'asc' ? (
                          <ArrowUpIcon />
                        ) : sorted === 'desc' ? (
                          <ArrowDownIcon />
                        ) : (
                          <ArrowUpDownIcon className="opacity-40" />
                        )}
                      </Button>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 5) }, (_, index) => (
                <TableRow key={index}>
                  {columns.map((_column, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t`No products found.`}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={NUMERIC_COLUMNS.has(cell.column.id) ? 'text-right' : undefined}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <p className="text-muted-foreground" aria-live="polite">
          {t`Showing ${firstRow}–${lastRow} of ${total}`}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t`Rows per page`}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" aria-label={t`Rows per page`} className="w-20">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground">{t`Page ${page} of ${pageCount}`}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t`Previous`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t`Next`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
