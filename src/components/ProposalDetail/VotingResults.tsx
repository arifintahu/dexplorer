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
    return totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : '0.0'
  }

  const voteTypes = [
    {
      label: 'Yes Votes',
      count: yesCount,
      percentage: calculatePercentage(yesCount),
      color: colors.status.success,
      bgColor: colors.status.success + '20'
    },
    {
      label: 'No Votes',
      count: noCount,
      percentage: calculatePercentage(noCount),
      color: colors.status.error,
      bgColor: colors.status.error + '20'
    },
    {
      label: 'Abstain Votes',
      count: abstainCount,
      percentage: calculatePercentage(abstainCount),
      color: colors.text.tertiary,
      bgColor: colors.text.tertiary + '20'
    },
    {
      label: 'No With Veto',
      count: noWithVetoCount,
      percentage: calculatePercentage(noWithVetoCount),
      color: colors.status.warning,
      bgColor: colors.status.warning + '20'
    }
  ]

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
        Voting Results
      </h3>
      <div className="space-y-6">
        {voteTypes.map((voteType, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span style={{ color: colors.text.secondary }}>{voteType.label}:</span>
              <div className="flex items-center gap-2">
                <span style={{ color: voteType.color, fontWeight: '600' }}>
                  {voteType.count.toLocaleString()}
                </span>
                <span style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
                  ({voteType.percentage}%)
                </span>
              </div>
            </div>
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border.secondary }}
            >
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${voteType.percentage}%`,
                  backgroundColor: voteType.color,
                  background: `linear-gradient(90deg, ${voteType.color}, ${voteType.color}dd)`
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Total Votes Summary */}
        <div className="pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
          <div className="flex justify-between items-center">
            <span style={{ color: colors.text.secondary, fontWeight: '600' }}>Total Votes:</span>
            <span style={{ color: colors.text.primary, fontWeight: '700', fontSize: '1.125rem' }}>
              {totalVotes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
