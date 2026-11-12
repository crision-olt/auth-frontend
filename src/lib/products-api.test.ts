import { afterEach, describe, expect, it, vi } from 'vitest'
import { createProductsApi, ProductsApiError } from './products-api'

const product = {
  id: 1,
  name: 'Blue Mug',
  description: null,
  sku: 'MUG-1',
  category: 'Kitchen',
  subcategory: 'Mugs',
  price: 9.99,
  stock: 5,
  created_at: '2026-01-01T00:00:00.000Z',
}
const page = { data: [product], total: 1, page: 2, pageSize: 10 }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('products API', () => {
  it('sends only the defined filters as query params, with cookies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(page)))
    vi.stubGlobal('fetch', fetch)

    await expect(
      createProductsApi('https://api.example.com').listProducts({
        search: 'mug & more',
        category: undefined,
        subcategory: 'Mugs',
        minPrice: 0,
        inStock: false,
        sortBy: 'price',
        sortOrder: 'asc',
        page: 2,
      }),
    ).resolves.toEqual(page)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/products?search=mug+%26+more&subcategory=Mugs&minPrice=0&inStock=false&sortBy=price&sortOrder=asc&page=2',
      { credentials: 'include' },
    )
  })

  it('requests the bare collection when there are no filters', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(page)))
    vi.stubGlobal('fetch', fetch)

    await createProductsApi('https://api.example.com').listProducts()

    expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/products')
  })

  it('exposes unsuccessful HTTP statuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))

    await expect(createProductsApi('https://api.example.com').listProducts()).rejects.toMatchObject({
      name: 'ProductsApiError',
      status: 401,
    } satisfies Partial<ProductsApiError>)
  })

  it('rejects a response that does not match the products contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 1 }] }))))

    await expect(createProductsApi('https://api.example.com').listProducts()).rejects.toThrow()
  })

  it('lists subcategories, optionally within a category', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(['Mugs']))))
    vi.stubGlobal('fetch', fetch)
    const api = createProductsApi('https://api.example.com')

    await expect(api.listSubcategories('Home & Kitchen')).resolves.toEqual(['Mugs'])
    await api.listSubcategories()

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      'https://api.example.com/products/subcategories?category=Home+%26+Kitchen',
      'https://api.example.com/products/subcategories',
    ])
  })

  it('lists categories', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(['Books', 'Kitchen']))))

    await expect(createProductsApi('https://api.example.com').listCategories()).resolves.toEqual(['Books', 'Kitchen'])
  })
})
