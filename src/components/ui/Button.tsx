import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme()

    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      borderRadius: '0.75rem',
      transition: 'all 0.2s ease-in-out',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      outline: 'none',
      border: 'none',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    }

    const sizeStyles = {
      sm: {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
      },
      md: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
      },
      lg: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
      },
    }

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            boxShadow: `0 4px 12px ${colors.primary}30`,
          }
        case 'secondary':
          return {
            backgroundColor: colors.surface,
            color: colors.text.primary,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
          }
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: colors.text.primary,
          }
        case 'success':
          return {
            backgroundColor: colors.status.success,
            color: '#FFFFFF',
            boxShadow: `0 4px 12px ${colors.status.success}30`,
          }
        case 'danger':
          return {
            backgroundColor: colors.status.error,
            color: '#FFFFFF',
            boxShadow: `0 4px 12px ${colors.status.error}30`,
          }
        default:
          return {}
      }
    }

    const getHoverStyles = () => {
      if (disabled || loading) return {}

      switch (variant) {
        case 'primary':
          return {
            transform: 'translateY(-1px)',
            boxShadow: `0 6px 20px ${colors.primary}40`,
          }
        case 'secondary':
          return {
            transform: 'translateY(-1px)',
            backgroundColor: colors.backgroundSecondary,
            boxShadow: colors.shadow.md,
          }
        case 'outline':
          return {
            backgroundColor: `${colors.primary}10`,
          }
        case 'ghost':
          return {
            backgroundColor: `${colors.text.primary}10`,
          }
        case 'success':
          return {
            transform: 'translateY(-1px)',
            boxShadow: `0 6px 20px ${colors.status.success}40`,
          }
        case 'danger':
          return {
            transform: 'translateY(-1px)',
            boxShadow: `0 6px 20px ${colors.status.error}40`,
          }
        default:
          return {}
      }
    }

    const buttonStyle = {
      ...baseStyles,
      ...sizeStyles[size],
      ...getVariantStyles(),
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, getHoverStyles())
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, {
          transform: 'translateY(0)',
          ...getVariantStyles(),
        })
      }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
      }
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, getHoverStyles())
      }
    }

    return (
      <button
        ref={ref}
        style={buttonStyle}
        className={cn('focus:ring-2 focus:ring-offset-2', className)}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
