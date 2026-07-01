import { useParams } from 'react-router-dom'
import { FiAlertCircle } from 'react-icons/fi'
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
      <div className="flex flex-col gap-[18px]">
        <div
          className="h-4 w-32 animate-pulse rounded"
          style={{ backgroundColor: colors.border.secondary }}
        />

        <div className="panel-surface flex flex-col gap-6 rounded-[14px] px-6 py-[22px]">
          <div className="flex flex-col gap-3">
            <div
              className="h-6 w-3/4 animate-pulse rounded"
              style={{ backgroundColor: colors.border.secondary }}
            />
            <div
              className="h-4 w-40 animate-pulse rounded"
              style={{ backgroundColor: colors.border.secondary }}
            />
          </div>
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded"
                style={{ backgroundColor: colors.border.secondary }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col gap-[18px]">
        <ProposalHeader />

        <div className="panel-surface rounded-[14px] px-6 py-12 text-center">
          <FiAlertCircle
            className="mx-auto mb-4 h-16 w-16"
            style={{ color: colors.status.error }}
          />
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: colors.text.primary }}
          >
            {error || 'Proposal Not Found'}
          </h2>
          <p style={{ color: colors.text.secondary }}>
            The proposal you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <ProposalHeader />
      <ProposalSummary proposal={proposal} />
      <VotingResults proposal={proposal} />
      <ProposalMetadata proposal={proposal} />
      <ProposalMessages proposal={proposal} />
    </div>
  )
}
