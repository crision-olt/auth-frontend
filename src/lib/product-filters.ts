import type { ProductsQuery } from '@/lib/products-api'

export type StockFilter = 'all' | 'in' | 'out'

export type ProductFilterValues = {
  search: string
  category: string
  subcategory: string
  minPrice: string
  maxPrice: string
  stock: StockFilter
}

export const emptyFilters: ProductFilterValues = {
  search: '',
  category: '',
  subcategory: '',
  minPrice: '',
  maxPrice: '',
  stock: 'all',
}

function parsePrice(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

export function hasInvalidPrice(raw: string): boolean {
  return raw.trim() !== '' && parsePrice(raw) === undefined
}

export function hasInvalidPriceRange(filters: ProductFilterValues): boolean {
  const min = parsePrice(filters.minPrice)
  const max = parsePrice(filters.maxPrice)
  return (
    hasInvalidPrice(filters.minPrice) ||
    hasInvalidPrice(filters.maxPrice) ||
    (min !== undefined && max !== undefined && min > max)
  )
}

export function hasActiveFilters(filters: ProductFilterValues): boolean {
  return (Object.keys(emptyFilters) as (keyof ProductFilterValues)[]).some(
    (key) => filters[key] !== emptyFilters[key],
  )
}

export function toProductsQuery(filters: ProductFilterValues): ProductsQuery {
  return {
    search: filters.search.trim() || undefined,
    category: filters.category || undefined,
    subcategory: filters.subcategory || undefined,
    minPrice: parsePrice(filters.minPrice),
    maxPrice: parsePrice(filters.maxPrice),
    inStock: filters.stock === 'all' ? undefined : filters.stock === 'in',
  }
}
