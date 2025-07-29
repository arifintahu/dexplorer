import React from 'react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const { colors } = useTheme()

  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: 'white',
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text.primary,
      borderColor: colors.border.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      borderColor: 'transparent',
    },
    success: {
      backgroundColor: colors.status.success,
      color: 'white',
      borderColor: colors.status.success,
    },
    danger: {
      backgroundColor: colors.status.error,
      color: 'white',
      borderColor: colors.status.error,
    },
  }

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], 'border', className)}
      style={variantStyles[variant]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button
