export const colors = {
  light: {
    primary: '#4f7cff',
    primaryHover: '#3d6ef4',
    accent: '#6f97ff',
    accentHover: '#5987ff',
    background: '#f4f7fb',
    backgroundSecondary: '#ebf0f8',
    backgroundTertiary: '#dfe7f4',
    surface: '#ffffff',
    surfaceHover: '#f8fbff',
    text: {
      primary: '#0f172a',
      secondary: '#4f5f7c',
      tertiary: '#6b7690',
      inverse: '#ffffff',
    },
    border: {
      primary: '#d8e2f0',
      secondary: '#c4d0e4',
      focus: '#4f7cff',
    },
    status: {
      success: '#0c865e',
      warning: '#a3690a',
      error: '#d63d3d',
      info: '#4670e0',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      md: '0 10px 30px -18px rgb(15 23 42 / 0.2)',
      lg: '0 24px 60px -34px rgb(15 23 42 / 0.28)',
      glow: '0 16px 40px -28px rgb(79 124 255 / 0.38)',
    },
  },
  dark: {
    primary: '#5b86ff',
    primaryHover: '#79a1ff',
    accent: '#7ea0ff',
    accentHover: '#98b4ff',
    background: '#07090d',
    backgroundSecondary: '#0f131b',
    backgroundTertiary: '#171d29',
    surface: '#10151d',
    surfaceHover: '#171d27',
    text: {
      primary: '#f5f7fb',
      secondary: '#afbbd0',
      tertiary: '#74819a',
      inverse: '#07090d',
    },
    border: {
      primary: '#262d39',
      secondary: '#313948',
      focus: '#5b86ff',
    },
    status: {
      success: '#23d3a0',
      warning: '#fbbf24',
      error: '#fb7185',
      info: '#7ea0ff',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.34)',
      md: '0 18px 45px -32px rgb(0 0 0 / 0.65)',
      lg: '0 32px 70px -40px rgb(0 0 0 / 0.82)',
      glow: '0 18px 44px -28px rgb(91 134 255 / 0.4)',
    },
  },
}

export type ColorScheme = 'light' | 'dark'
export type ThemeColors = typeof colors.light
