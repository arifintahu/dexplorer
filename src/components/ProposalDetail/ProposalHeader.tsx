import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiChevronRight } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'

interface ProposalHeaderProps {
  id: string
  proposal: Proposal | null
}

export default function ProposalHeader({ id, proposal }: ProposalHeaderProps) {
  const { colors } = useTheme()

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        to="/"
        className="flex items-center gap-1 hover:underline"
        style={{ color: colors.text.secondary }}
      >
        <FiHome className="w-4 h-4" />
        Home
      </Link>
      <FiChevronRight className="w-4 h-4" style={{ color: colors.text.tertiary }} />
      <Link
        to="/proposals"
        className="hover:underline"
        style={{ color: colors.text.secondary }}
      >
        Proposals
      </Link>
      <FiChevronRight className="w-4 h-4" style={{ color: colors.text.tertiary }} />
      <span style={{ color: colors.text.primary }}>
        Proposal #{proposal ? proposal.id.toString() : id}
      </span>
    </div>
  )
}
