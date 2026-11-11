import { z } from 'zod'
import type { LoginValues } from '@/lib/auth-schemas'

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  created_at: z.string(),
})

export class AuthApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Authentication request failed with HTTP ${status}`)
    this.name = 'AuthApiError'
    this.status = status
  }
}

export function createAuthApi(serviceUrl: string) {
  async function submit(path: string, values: LoginValues) {
    let baseUrl: URL
    try {
      baseUrl = new URL(serviceUrl)
    } catch {
      throw new Error('AUTH_SERVICE_URL must be an absolute HTTP(S) URL')
    }
    if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
      throw new Error('AUTH_SERVICE_URL must be an absolute HTTP(S) URL')
    }

    const response = await fetch(new URL(path, baseUrl).href, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, password: values.password }),
    })
    if (!response.ok) throw new AuthApiError(response.status)
    return userSchema.parse(await response.json())
  }

  return {
    login: (values: LoginValues) => submit('/auth/login', values),
    registerUser: (values: LoginValues) => submit('/auth/register', values),
  }
}

export const { login, registerUser } = createAuthApi(import.meta.env.AUTH_SERVICE_URL)
