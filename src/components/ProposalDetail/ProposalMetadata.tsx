import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { displayDate } from '@/utils/helper'
import { formatAmount, getConvertedAmount } from '@/utils/cosmos'

interface ProposalMetadataProps {
  proposal: Proposal
}

export default function ProposalMetadata({ proposal }: ProposalMetadataProps) {
  const { colors } = useTheme()

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Proposal Details
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span style={{ color: colors.text.secondary }}>Proposal ID:</span>
          <span style={{ color: colors.text.primary }}>#{proposal.id.toString()}</span>
        </div>
        {proposal.submitTime && (
          <div className="flex justify-between">
            <span style={{ color: colors.text.secondary }}>Submit Time:</span>
            <span style={{ color: colors.text.primary }}>
              {displayDate(new Date(Number(proposal.submitTime.seconds) * 1000).toISOString())}
            </span>
          </div>
        )}
        {proposal.depositEndTime && (
          <div className="flex justify-between">
            <span style={{ color: colors.text.secondary }}>Deposit End Time:</span>
            <span style={{ color: colors.text.primary }}>
              {displayDate(new Date(Number(proposal.depositEndTime.seconds) * 1000).toISOString())}
            </span>
          </div>
        )}
        {proposal.votingStartTime && (
          <div className="flex justify-between">
            <span style={{ color: colors.text.secondary }}>Voting Start Time:</span>
            <span style={{ color: colors.text.primary }}>
              {displayDate(new Date(Number(proposal.votingStartTime.seconds) * 1000).toISOString())}
            </span>
          </div>
        )}
        {proposal.votingEndTime && (
          <div className="flex justify-between">
            <span style={{ color: colors.text.secondary }}>Voting End Time:</span>
            <span style={{ color: colors.text.primary }}>
              {displayDate(new Date(Number(proposal.votingEndTime.seconds) * 1000).toISOString())}
            </span>
          </div>
        )}
        {proposal.totalDeposit && proposal.totalDeposit.length > 0 && (
          <div className="flex justify-between">
            <span style={{ color: colors.text.secondary }}>Total Deposit:</span>
            <span style={{ color: colors.text.primary }}>
              {(() => {
                const converted = getConvertedAmount(proposal.totalDeposit[0].amount, proposal.totalDeposit[0].denom);
                return `${formatAmount(converted.converted)} ${converted.base.toUpperCase()}`;
              })()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
