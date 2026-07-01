import React from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'

export default function ProposalHeader() {
  const { colors } = useTheme()

  return (
    <Link
      to="/proposals"
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: colors.text.secondary }}
    >
      <FiChevronLeft className="h-4 w-4" />
      Back to governance
    </Link>
  )
}
