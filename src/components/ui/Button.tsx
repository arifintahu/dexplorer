import React from 'react'
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
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary:
      'bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)]',
    secondary:
      'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border-primary)] hover:bg-[var(--color-surface-hover)]',
    outline:
      'bg-transparent text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
    ghost:
      'bg-transparent text-[var(--color-text-primary)] border-transparent hover:bg-[var(--color-surface-hover)]',
    success:
      'bg-[var(--color-status-success)] text-white border-[var(--color-status-success)] hover:brightness-110',
    danger:
      'bg-[var(--color-status-error)] text-white border-[var(--color-status-error)] hover:brightness-110',
  }

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        'border',
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button
