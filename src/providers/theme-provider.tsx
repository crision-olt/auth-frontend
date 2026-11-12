import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'app-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  const applyTheme = useCallback((newTheme: Theme) => {
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = stored || (systemPrefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
      return newTheme
    })
  }, [applyTheme])

  

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {mounted && children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
