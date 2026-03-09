import React, { useMemo } from 'react'

interface AvatarProps {
  address: string
  size?: number
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ address, size = 32, className }) => {
  const color = useMemo(() => {
    let hash = 0
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
  }, [address])

  const gradient = useMemo(() => {
    // Generate a complementary color for gradient
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const compR = (255 - r).toString(16).padStart(2, '0')
    const compG = (255 - g).toString(16).padStart(2, '0')
    const compB = (255 - b).toString(16).padStart(2, '0')

    return `linear-gradient(135deg, ${color}, #${compR}${compG}${compB})`
  }, [color])

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden shadow-sm ${className || ''}`}
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
      title={address}
    >
      <span className="text-white text-xs font-bold opacity-80 mix-blend-overlay">
        {address.substring(address.length - 2).toUpperCase()}
      </span>
    </div>
  )
}

export default Avatar
