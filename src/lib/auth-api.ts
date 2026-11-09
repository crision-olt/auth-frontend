import type { LoginValues, RegisterValues } from '@/lib/auth-schemas'

// TODO: replace with real calls to your backend (fetch to VITE_API_URL).
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms))

export async function login(values: LoginValues): Promise<void> {
  await delay()
  console.info('login', { email: values.email })
}

export async function registerUser(
  values: Omit<RegisterValues, 'confirmPassword'>,
): Promise<void> {
  await delay()
  console.info('register', { email: values.email })
}
