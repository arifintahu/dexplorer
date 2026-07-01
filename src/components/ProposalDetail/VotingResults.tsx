import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'

interface VotingResultsProps {
  proposal: Proposal
}

export default function VotingResults({ proposal }: VotingResultsProps) {
  const { colors } = useTheme()

  if (!proposal.finalTallyResult) return null

  const yesCount = Number(proposal.finalTallyResult.yesCount) || 0
  const noCount = Number(proposal.finalTallyResult.noCount) || 0
  const abstainCount = Number(proposal.finalTallyResult.abstainCount) || 0
  const noWithVetoCount = Number(proposal.finalTallyResult.noWithVetoCount) || 0
  const totalVotes = yesCount + noCount + abstainCount + noWithVetoCount

  const calculatePercentage = (count: number) => {
    return totalVotes > 0 ? (count / totalVotes) * 100 : 0
  }

  const voteTypes = [
    {
      label: 'Yes',
      count: yesCount,
      percentage: calculatePercentage(yesCount),
      color: colors.status.success,
    },
    {
      label: 'No',
      count: noCount,
      percentage: calculatePercentage(noCount),
      color: colors.status.error,
    },
    {
      label: 'Abstain',
      count: abstainCount,
      percentage: calculatePercentage(abstainCount),
      color: colors.text.tertiary,
    },
    {
      label: 'No w/ Veto',
      count: noWithVetoCount,
      percentage: calculatePercentage(noWithVetoCount),
      color: colors.status.warning,
    },
  ]

  return (
    <div className="panel-surface flex flex-col gap-4 rounded-[14px] px-[22px] py-5">
      <span
        className="text-[14px] font-semibold"
        style={{ color: colors.text.primary }}
      >
        Voting Results
      </span>

      <div
        className="flex h-3 overflow-hidden rounded-[6px]"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        {voteTypes.map((voteType) => (
          <div
            key={voteType.label}
            style={{
              width: `${voteType.percentage}%`,
              backgroundColor: voteType.color,
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {voteTypes.map((voteType) => (
          <div
            key={voteType.label}
            className="flex flex-col gap-1.5 rounded-[10px] border px-[15px] py-[13px]"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border.primary,
            }}
          >
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: colors.text.secondary }}
            >
              <span
                className="h-[9px] w-[9px] rounded-[2px]"
                style={{ backgroundColor: voteType.color }}
              />
              {voteType.label}
            </span>
            <span
              className="font-mono text-[18px] font-semibold"
              style={{ color: colors.text.primary }}
            >
              {voteType.percentage.toFixed(1)}%
            </span>
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              {voteType.count.toLocaleString()} votes
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
