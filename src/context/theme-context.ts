import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'asasera.theme'

export type ThemeContextValue = {
  /** What the user chose, including `system`. */
  mode: ThemeMode
  /** What is actually painted right now. */
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  /** Flips between light and dark, resolving `system` first. */
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
