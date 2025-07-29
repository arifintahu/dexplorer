import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface Colors {
  primary: string
  background: string
  surface: string
  text: {
    primary: string
    secondary: string
    tertiary: string
  }
  border: {
    primary: string
    secondary: string
  }
  status: {
    success: string
    error: string
    warning: string
    info: string
  }
  shadow: {
    sm: string
    md: string
  }
}

const lightColors: Colors = {
  primary: '#3B82F6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
  border: {
    primary: '#E2E8F0',
    secondary: '#F1F5F9',
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
}

const darkColors: Colors = {
  primary: '#60A5FA',
  background: '#0F172A',
  surface: '#1E293B',
  text: {
    primary: '#F1F5F9',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
  },
  border: {
    primary: '#334155',
    secondary: '#475569',
  },
  status: {
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
  },
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      return savedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const colors = theme === 'light' ? lightColors : darkColors

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    colors,
  }
}
