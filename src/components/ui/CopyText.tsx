import React, { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { toast } from 'sonner'
import { useTheme } from '@/theme/ThemeProvider'

interface CopyTextProps {
  text: string
  displayText?: string
  className?: string
  style?: React.CSSProperties
  /**
   * Set to -1 when nesting CopyText inside another interactive element (e.g.
   * a Link/button) so it doesn't create a second, redundant tab stop.
   */
  tabIndex?: number
}

const CopyText: React.FC<CopyTextProps> = ({
  text,
  displayText,
  className,
  style,
  tabIndex = 0,
}) => {
  const { colors } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCopy(e)
    }
  }

  return (
    <div
      className={`flex items-center gap-2 group cursor-pointer rounded focus:outline-none focus-visible:ring-2 ${className || ''}`}
      style={
        {
          ...style,
          '--tw-ring-color': colors.border.focus,
        } as React.CSSProperties
      }
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={tabIndex}
      title="Click to copy"
      aria-label={`Copy ${displayText || text}`}
    >
      <span className="font-mono">{displayText || text}</span>
      <span
        className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity p-1 rounded group-hover:bg-[var(--copy-hover-bg)] group-focus-visible:bg-[var(--copy-hover-bg)]"
        style={
          {
            color: colors.text.secondary,
            '--copy-hover-bg': colors.surfaceHover,
          } as React.CSSProperties
        }
      >
        {copied ? (
          <FiCheck className="w-3 h-3 text-green-500" />
        ) : (
          <FiCopy className="w-3 h-3" />
        )}
      </span>
    </div>
  )
}

export default CopyText
