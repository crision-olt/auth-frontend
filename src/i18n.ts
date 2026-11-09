import { i18n } from '@lingui/core'

export const LOCALES = { en: 'English', es: 'Español' } as const
export type Locale = keyof typeof LOCALES

const STORAGE_KEY = 'locale'

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && value in LOCALES
}

export function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isLocale(stored)) return stored
  const browser = navigator.language.slice(0, 2)
  return isLocale(browser) ? browser : 'en'
}

export async function activateLocale(locale: Locale) {
  const { messages } = await import(`./locales/${locale}/messages.po`)
  i18n.loadAndActivate({ locale, messages })
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}
