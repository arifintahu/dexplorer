import React, { createContext, useContext, useEffect, useState } from 'react'
import { ColorScheme, colors } from './colors'

interface ThemeContextType {
  colorScheme: ColorScheme
  toggleColorScheme: () => void
  colors: typeof colors.light
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme') as ColorScheme
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light'
    setColorScheme(newScheme)
    localStorage.setItem('theme', newScheme)
  }

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(colorScheme)

    // Set CSS custom properties for dynamic theming
    const themeColors = colors[colorScheme]
    root.style.setProperty('--color-primary', themeColors.primary)
    root.style.setProperty('--color-primary-hover', themeColors.primaryHover)
    root.style.setProperty('--color-background', themeColors.background)
    root.style.setProperty(
      '--color-background-secondary',
      themeColors.backgroundSecondary
    )
    root.style.setProperty('--color-surface', themeColors.surface)
    root.style.setProperty('--color-text-primary', themeColors.text.primary)
    root.style.setProperty('--color-text-secondary', themeColors.text.secondary)
    root.style.setProperty('--color-border-primary', themeColors.border.primary)
  }, [colorScheme])

  const value = {
    colorScheme,
    toggleColorScheme,
    colors: colors[colorScheme],
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
