import { z } from 'zod'
import { resolveServiceUrl } from '@/lib/http'

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  category: z.string(),
  subcategory: z.string().nullable(),
  price: z.number(),
  stock: z.number(),
  created_at: z.string(),
})

const productsPageSchema = z.object({
  data: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

const categoriesSchema = z.array(z.string())

export type Product = z.infer<typeof productSchema>
export type ProductsPage = z.infer<typeof productsPageSchema>

export const SORTABLE_COLUMNS = ['name', 'sku', 'category', 'subcategory', 'price', 'stock', 'created_at'] as const
export type SortableColumn = (typeof SORTABLE_COLUMNS)[number]

export type ProductsQuery = {
  search?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: SortableColumn
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export class ProductsApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Products request failed with HTTP ${status}`)
    this.name = 'ProductsApiError'
    this.status = status
  }
}

export function createProductsApi(serviceUrl: string) {
  async function get(path: string) {
    const response = await fetch(resolveServiceUrl(serviceUrl, path), { credentials: 'include' })
    if (!response.ok) throw new ProductsApiError(response.status)
    return response.json()
  }

  return {
    async listProducts(query: ProductsQuery = {}) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') params.set(key, String(value))
      }
      const suffix = params.size ? `?${params}` : ''
      return productsPageSchema.parse(await get(`/products${suffix}`))
    },
    async listCategories() {
      return categoriesSchema.parse(await get('/products/categories'))
    },
    async listSubcategories(category?: string) {
      const suffix = category ? `?${new URLSearchParams({ category })}` : ''
      return categoriesSchema.parse(await get(`/products/subcategories${suffix}`))
    },
  }
}

export const { listProducts, listCategories, listSubcategories } = createProductsApi(import.meta.env.AUTH_SERVICE_URL)
