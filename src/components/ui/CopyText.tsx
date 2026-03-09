import React, { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { toast } from 'sonner'
import { useTheme } from '@/theme/ThemeProvider'

interface CopyTextProps {
  text: string
  displayText?: string
  className?: string
  style?: React.CSSProperties
}

const CopyText: React.FC<CopyTextProps> = ({
  text,
  displayText,
  className,
  style,
}) => {
  const { colors } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex items-center gap-2 group cursor-pointer ${className || ''}`}
      style={style}
      onClick={handleCopy}
      title="Click to copy"
    >
      <span className="font-mono">{displayText || text}</span>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Copy"
        style={{ color: colors.text.secondary }}
      >
        {copied ? (
          <FiCheck className="w-3 h-3 text-green-500" />
        ) : (
          <FiCopy className="w-3 h-3" />
        )}
      </button>
    </div>
  )
}

export default CopyText
