import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { FiUser } from 'react-icons/fi'

interface ValidatorIconProps {
  identity?: string
  moniker: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ValidatorIcon: React.FC<ValidatorIconProps> = ({
  identity,
  moniker,
  size = 'md',
  className = '',
}) => {
  const { colors } = useTheme()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !identity) return

    let isMounted = true
    setImageUrl(null)
    setHasError(false)

    const fetchIcon = async () => {
      try {
        const response = await fetch(
          `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`
        )
        const data = await response.json()

        if (
          isMounted &&
          data.status.name === 'OK' &&
          data.them?.[0]?.pictures?.primary?.url
        ) {
          setImageUrl(data.them[0].pictures.primary.url)
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Failed to fetch validator icon:', error)
          setHasError(true)
        }
      }
    }

    fetchIcon()

    return () => {
      isMounted = false
    }
  }, [identity, isVisible])

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={moniker}
        loading="lazy"
        className={`rounded-full object-cover ${sizeClass[size]} ${className}`}
        onError={() => setHasError(true)}
        style={{
          border: `1px solid ${colors.border.primary}`,
        }}
      />
    )
  }

  // Fallback to initial
  return (
    <div
      ref={imgRef}
      className={`rounded-full flex items-center justify-center font-bold ${sizeClass[size]} ${className}`}
      style={{
        backgroundColor: colors.primary + '20',
        color: colors.primary,
        border: `1px solid ${colors.primary}40`,
      }}
    >
      {moniker ? moniker.charAt(0).toUpperCase() : <FiUser />}
    </div>
  )
}

export default ValidatorIcon
