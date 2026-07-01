import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/theme/ThemeProvider'
import { formatNumber } from '@/lib/utils'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  subtitle?: string
  iconColor?: string
  isLoading?: boolean
  index?: number
}

const StatCard: React.FC<StatCardProps> = React.memo(
  ({
    title,
    value,
    icon: Icon,
    subtitle,
    iconColor,
    isLoading = false,
    index = 0,
  }) => {
    const { colors } = useTheme()
    const cardIconColor = iconColor || colors.primary

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: index * 0.05, ease: 'easeOut' }}
        className="panel-surface rounded-[14px] px-5 py-[18px]"
        style={{
          borderColor: colors.border.primary,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] font-ui"
              style={{ color: colors.text.tertiary }}
            >
              {title}
            </p>

            {isLoading ? (
              <div className="space-y-2">
                <SkeletonLoader width="120px" height="2.5rem" variant="text" />
                {subtitle && (
                  <SkeletonLoader width="80px" height="1rem" variant="text" />
                )}
              </div>
            ) : (
              <>
                <motion.p
                  key={String(value)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="mb-2 font-mono text-[2rem] font-semibold tracking-[-0.04em]"
                  style={{ color: colors.text.primary }}
                >
                  {typeof value === 'number' ? formatNumber(value) : value}
                </motion.p>

                {subtitle && (
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px]"
            style={{
              backgroundColor: `${cardIconColor}12`,
              border: `1px solid ${cardIconColor}2c`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: cardIconColor }} />
          </div>
        </div>
      </motion.div>
    )
  }
)

export default StatCard
