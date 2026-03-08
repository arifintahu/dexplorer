import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { formatNumber } from '@/lib/utils'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
  isLoading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconColor,
  isLoading = false,
}) => {
  const { colors } = useTheme()
  const cardIconColor = iconColor || colors.primary

  return (
    <div
      className="group rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = colors.shadow.lg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = colors.shadow.sm
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${cardIconColor}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: cardIconColor }} />
            </div>
            <p
              className="text-sm font-medium tracking-wide uppercase"
              style={{ color: colors.text.secondary }}
            >
              {title}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <SkeletonLoader width="120px" height="2.5rem" variant="text" />
              {subtitle && (
                <SkeletonLoader width="80px" height="1rem" variant="text" />
              )}
            </div>
          ) : (
            <>
              <p
                className="text-3xl font-bold mb-2 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                {typeof value === 'number' ? formatNumber(value) : value}
              </p>

              {subtitle && (
                <p
                  className="text-sm mb-2"
                  style={{ color: colors.text.tertiary }}
                >
                  {subtitle}
                </p>
              )}
            </>
          )}

          {trend && !isLoading && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <FiTrendingUp
                  className="h-4 w-4"
                  style={{ color: colors.status.success }}
                />
              ) : (
                <FiTrendingDown
                  className="h-4 w-4"
                  style={{ color: colors.status.error }}
                />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: trend.isPositive
                    ? colors.status.success
                    : colors.status.error,
                }}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs" style={{ color: colors.text.tertiary }}>
                vs last hour
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
