import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'

interface SkeletonLoaderProps {
  width?: string
  height?: string
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
}) => {
  const { colors } = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-md'
      case 'text':
      default:
        return 'rounded'
    }
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
      <div
        className={`skeleton-shimmer ${getVariantStyles()} ${className}`}
        style={{
          width,
          height,
          backgroundColor: `${colors.border.secondary}40`,
          backgroundImage: `linear-gradient(90deg, transparent, ${colors.border.secondary}80, transparent)`,
          backgroundSize: '200% 100%',
        }}
      />
    </>
  )
}

export default SkeletonLoader
