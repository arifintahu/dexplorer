import { useParams, Link } from 'react-router-dom'
import {
  FiChevronRight,
  FiHome,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { useProposalData } from '@/hooks/useProposalData'
import ProposalHeader from '@/components/ProposalDetail/ProposalHeader'
import ProposalSummary from '@/components/ProposalDetail/ProposalSummary'
import ProposalMetadata from '@/components/ProposalDetail/ProposalMetadata'
import VotingResults from '@/components/ProposalDetail/VotingResults'
import ProposalMessages from '@/components/ProposalDetail/ProposalMessages'

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const { colors } = useTheme()
  const { proposal, isLoading, error } = useProposalData(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-12 rounded animate-pulse"
            style={{ backgroundColor: colors.border.secondary }}
          ></div>
          <FiChevronRight className="w-4 h-4" style={{ color: colors.text.tertiary }} />
          <div
            className="h-4 w-20 rounded animate-pulse"
            style={{ backgroundColor: colors.border.secondary }}
          ></div>
          <FiChevronRight className="w-4 h-4" style={{ color: colors.text.tertiary }} />
          <div
            className="h-4 w-32 rounded animate-pulse"
            style={{ backgroundColor: colors.border.secondary }}
          ></div>
        </div>

        {/* Content Skeleton */}
        <div
          className="rounded-xl p-6 space-y-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="space-y-4">
            <div
              className="h-8 w-3/4 rounded animate-pulse"
              style={{ backgroundColor: colors.border.secondary }}
            ></div>
            <div
              className="h-6 w-32 rounded animate-pulse"
              style={{ backgroundColor: colors.border.secondary }}
            ></div>
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded animate-pulse"
                style={{ backgroundColor: colors.border.secondary }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
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
          <span style={{ color: colors.text.primary }}>Proposal #{id}</span>
        </div>

        {/* Error State */}
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <FiAlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colors.status.error }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            {error || 'Proposal Not Found'}
          </h2>
          <p className="mb-6" style={{ color: colors.text.secondary }}>
            The proposal you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link
            to="/proposals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <FiFileText className="w-4 h-4" />
            Back to Proposals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProposalHeader id={id || ''} proposal={proposal} />
      <ProposalSummary proposal={proposal} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProposalMetadata proposal={proposal} />
        <VotingResults proposal={proposal} />
      </div>
      <ProposalMessages proposal={proposal} />
    </div>
  )
}
