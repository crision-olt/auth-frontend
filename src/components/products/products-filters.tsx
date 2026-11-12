import { useLingui } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  emptyFilters,
  hasActiveFilters,
  hasInvalidPrice,
  hasInvalidPriceRange,
  type ProductFilterValues,
  type StockFilter,
} from '@/lib/product-filters'

const ALL = '__all__'

type Props = {
  filters: ProductFilterValues
  categories: string[]
  subcategories: string[]
  onChange: (filters: ProductFilterValues) => void
}

export function ProductsFilters({ filters, categories, subcategories, onChange }: Props) {
  const { t } = useLingui()
  const update = (patch: Partial<ProductFilterValues>) => onChange({ ...filters, ...patch })
  const rangeInvalid = hasInvalidPriceRange(filters)
  const minInvalid = hasInvalidPrice(filters.minPrice)
  const maxInvalid = hasInvalidPrice(filters.maxPrice)
  const orderInvalid = rangeInvalid && !minInvalid && !maxInvalid

  const stockLabels: Record<StockFilter, string> = {
    all: t`All`,
    in: t`In stock`,
    out: t`Out of stock`,
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-search">{t`Search`}</Label>
          <Input
            id="filter-search"
            type="search"
            value={filters.search}
            placeholder={t`Name, SKU or description`}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">{t`Category`}</Label>
          <Select
            value={filters.category || ALL}
            onValueChange={(value) =>
              update({ category: value === ALL || value === null ? '' : value, subcategory: '' })
            }
          >
            <SelectTrigger id="filter-category" className="w-full">
              <SelectValue>{filters.category || t`All`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t`All`}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-subcategory">{t`Subcategory`}</Label>
          <Select
            value={filters.subcategory || ALL}
            onValueChange={(value) => update({ subcategory: value === ALL || value === null ? '' : value })}
          >
            <SelectTrigger id="filter-subcategory" className="w-full">
              <SelectValue>{filters.subcategory || t`All`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t`All`}</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-min-price">{t`Min price`}</Label>
          <Input
            id="filter-min-price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={filters.minPrice}
            aria-invalid={minInvalid || orderInvalid}
            onChange={(event) => update({ minPrice: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-max-price">{t`Max price`}</Label>
          <Input
            id="filter-max-price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={filters.maxPrice}
            aria-invalid={maxInvalid || orderInvalid}
            onChange={(event) => update({ maxPrice: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-stock">{t`Availability`}</Label>
          <Select
            value={filters.stock}
            onValueChange={(value) => update({ stock: (value ?? 'all') as StockFilter })}
          >
            <SelectTrigger id="filter-stock" className="w-full">
              <SelectValue>{stockLabels[filters.stock]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(stockLabels) as StockFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {stockLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" disabled={!hasActiveFilters(filters)} onClick={() => onChange(emptyFilters)}>
          {t`Clear filters`}
        </Button>
      </div>
      {rangeInvalid && (
        <p role="alert" className="text-sm text-destructive">
          {t`Enter a valid price range: the minimum cannot exceed the maximum.`}
        </p>
      )}
    </div>
  )
}
