import React, { createContext, useContext, useEffect, useState } from 'react'
import { ColorScheme, colors } from './colors'

export type ThemeMode = ColorScheme | 'system'

interface ThemeContextType {
  colorScheme: ColorScheme
  toggleColorScheme: () => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  colors: typeof colors.light
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

const THEME_MODE_STORAGE_KEY = 'theme-mode'

const getSystemColorScheme = (): ColorScheme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const readStoredThemeMode = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] =
    useState<ThemeMode>(readStoredThemeMode)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() =>
    themeMode === 'system' ? getSystemColorScheme() : themeMode
  )

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
    setColorScheme(mode === 'system' ? getSystemColorScheme() : mode)
  }

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light'
    setThemeMode(newScheme)
  }

  useEffect(() => {
    if (themeMode !== 'system') {
      return
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(colorScheme)

    // Set CSS custom properties for dynamic theming
    const themeColors = colors[colorScheme]
    root.style.setProperty('--color-primary', themeColors.primary)
    root.style.setProperty('--color-primary-hover', themeColors.primaryHover)
    root.style.setProperty('--color-accent', themeColors.accent)
    root.style.setProperty('--color-background', themeColors.background)
    root.style.setProperty(
      '--color-background-secondary',
      themeColors.backgroundSecondary
    )
    root.style.setProperty(
      '--color-background-tertiary',
      themeColors.backgroundTertiary
    )
    root.style.setProperty('--color-surface', themeColors.surface)
    root.style.setProperty('--color-surface-hover', themeColors.surfaceHover)
    root.style.setProperty('--color-text-primary', themeColors.text.primary)
    root.style.setProperty('--color-text-secondary', themeColors.text.secondary)
    root.style.setProperty('--color-text-tertiary', themeColors.text.tertiary)
    root.style.setProperty('--color-text-inverse', themeColors.text.inverse)
    root.style.setProperty('--color-border-primary', themeColors.border.primary)
    root.style.setProperty(
      '--color-border-secondary',
      themeColors.border.secondary
    )
    root.style.setProperty('--color-border-focus', themeColors.border.focus)
    root.style.setProperty('--color-status-success', themeColors.status.success)
    root.style.setProperty('--color-status-warning', themeColors.status.warning)
    root.style.setProperty('--color-status-error', themeColors.status.error)
    root.style.setProperty('--color-status-info', themeColors.status.info)
    root.style.setProperty('--color-shadow-sm', themeColors.shadow.sm)
    root.style.setProperty('--color-shadow-md', themeColors.shadow.md)
    root.style.setProperty('--color-shadow-lg', themeColors.shadow.lg)
    if ('glow' in themeColors.shadow) {
      root.style.setProperty('--color-shadow-glow', themeColors.shadow.glow)
    }
  }, [colorScheme])

  const value = {
    colorScheme,
    toggleColorScheme,
    themeMode,
    setThemeMode,
    colors: colors[colorScheme],
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
