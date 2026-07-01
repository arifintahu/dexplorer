import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { displayDate, getTypeMsg, trimHash } from '@/utils/helper'
import { formatAmount, getConvertedAmount } from '@/utils/cosmos'

interface ProposalMetadataProps {
  proposal: Proposal
}

export default function ProposalMetadata({ proposal }: ProposalMetadataProps) {
  const { colors } = useTheme()

  const proposalType = proposal.messages.length
    ? getTypeMsg(proposal.messages[0].typeUrl)
    : 'Text Proposal'

  const rowStyle = {
    borderColor: colors.border.primary,
  }

  return (
    <div className="reference-table-shell rounded-[14px]">
      <div
        className="border-b px-5 py-[15px] text-[14px] font-semibold"
        style={{
          borderColor: colors.border.primary,
          color: colors.text.primary,
        }}
      >
        Details
      </div>

      <div
        className="flex items-center justify-between border-b px-5 py-3"
        style={rowStyle}
      >
        <span
          className="text-[12.5px]"
          style={{ color: colors.text.secondary }}
        >
          Proposal Type
        </span>
        <span className="text-[12.5px]" style={{ color: colors.text.primary }}>
          {proposalType}
        </span>
      </div>

      {proposal.proposer && (
        <div
          className="flex items-center justify-between gap-4 border-b px-5 py-3"
          style={rowStyle}
        >
          <span
            className="shrink-0 text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Proposer
          </span>
          <span
            className="break-all text-right font-mono text-[12px]"
            style={{ color: colors.text.primary }}
          >
            {trimHash(proposal.proposer, 14)}
          </span>
        </div>
      )}

      {proposal.submitTime && (
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={rowStyle}
        >
          <span
            className="text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Submit Time
          </span>
          <span
            className="font-mono text-[12.5px]"
            style={{ color: colors.text.primary }}
          >
            {displayDate(
              new Date(Number(proposal.submitTime.seconds) * 1000).toISOString()
            )}
          </span>
        </div>
      )}

      {proposal.depositEndTime && (
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={rowStyle}
        >
          <span
            className="text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Deposit End Time
          </span>
          <span
            className="font-mono text-[12.5px]"
            style={{ color: colors.text.primary }}
          >
            {displayDate(
              new Date(
                Number(proposal.depositEndTime.seconds) * 1000
              ).toISOString()
            )}
          </span>
        </div>
      )}

      {proposal.votingStartTime && (
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={rowStyle}
        >
          <span
            className="text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Voting Start Time
          </span>
          <span
            className="font-mono text-[12.5px]"
            style={{ color: colors.text.primary }}
          >
            {displayDate(
              new Date(
                Number(proposal.votingStartTime.seconds) * 1000
              ).toISOString()
            )}
          </span>
        </div>
      )}

      {proposal.votingEndTime && (
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={rowStyle}
        >
          <span
            className="text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Voting End Time
          </span>
          <span
            className="font-mono text-[12.5px]"
            style={{ color: colors.text.primary }}
          >
            {displayDate(
              new Date(
                Number(proposal.votingEndTime.seconds) * 1000
              ).toISOString()
            )}
          </span>
        </div>
      )}

      {proposal.totalDeposit && proposal.totalDeposit.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3">
          <span
            className="text-[12.5px]"
            style={{ color: colors.text.secondary }}
          >
            Total Deposit
          </span>
          <span
            className="font-mono text-[12.5px]"
            style={{ color: colors.text.primary }}
          >
            {(() => {
              const converted = getConvertedAmount(
                proposal.totalDeposit[0].amount,
                proposal.totalDeposit[0].denom
              )
              return `${formatAmount(converted.converted)} ${converted.base.toUpperCase()}`
            })()}
          </span>
        </div>
      )}
    </div>
  )
}
