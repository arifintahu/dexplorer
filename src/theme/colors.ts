// Modern color system for blockchain explorer
export const colors = {
  // Light mode colors
  light: {
    primary: '#00B5D8',
    primaryHover: '#0099B8',
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    backgroundTertiary: '#E5E7EB',
    surface: '#FFFFFF',
    surfaceHover: '#F9FAFB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    border: {
      primary: '#E5E7EB',
      secondary: '#D1D5DB',
      focus: '#00B5D8',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  },
  // Dark mode colors
  dark: {
    primary: '#0BC5EA',
    primaryHover: '#00B5D8',
    background: '#171D30',
    backgroundSecondary: '#2A334C',
    backgroundTertiary: '#374151',
    surface: '#1F2937',
    surfaceHover: '#374151',
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
    },
    border: {
      primary: '#374151',
      secondary: '#4B5563',
      focus: '#0BC5EA',
    },
    status: {
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    },
  },
}

export type ColorScheme = 'light' | 'dark'
export type ThemeColors = typeof colors.light
