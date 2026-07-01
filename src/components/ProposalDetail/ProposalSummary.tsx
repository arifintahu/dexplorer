import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import ReactMarkdown from 'react-markdown'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { proposalStatusList } from '@/utils/constant'
import { getTypeMsg, displayDate } from '@/utils/helper'

interface ProposalSummaryProps {
  proposal: Proposal
}

export default function ProposalSummary({ proposal }: ProposalSummaryProps) {
  const { colors } = useTheme()

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: // PASSED
        return colors.status.success
      case 4: // REJECTED
      case 5: // FAILED
        return colors.status.error
      case 2: // VOTING_PERIOD
        return colors.status.info
      case 1: // DEPOSIT_PERIOD
        return colors.status.warning
      default:
        return colors.text.tertiary
    }
  }

  const getStatusText = (status: number) => {
    const statusItem = proposalStatusList.find((s) => s.id === status)
    return statusItem ? statusItem.status.toLowerCase() : 'unknown'
  }

  const proposalType = proposal.messages.length
    ? getTypeMsg(proposal.messages[0].typeUrl)
    : 'Text Proposal'

  const votingEnd = proposal.votingEndTime
    ? displayDate(
        new Date(Number(proposal.votingEndTime.seconds) * 1000).toISOString()
      )
    : ''

  const statusColor = getStatusColor(proposal.status)

  return (
    <div className="panel-surface flex flex-col gap-[14px] rounded-[14px] px-6 py-[22px]">
      <div className="flex items-start gap-[14px]">
        <span
          className="font-mono text-[16px] font-semibold"
          style={{ color: colors.text.tertiary }}
        >
          #{proposal.id.toString()}
        </span>
        <span
          className="flex-1 text-[19px] font-semibold leading-[1.3]"
          style={{ color: colors.text.primary }}
        >
          {proposal.title}
        </span>
        <span
          className="reference-pill capitalize"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          {getStatusText(proposal.status)}
        </span>
      </div>

      <div className="text-[12.5px]" style={{ color: colors.text.tertiary }}>
        {proposalType}
        {votingEnd && ` · Voting ends ${votingEnd}`}
      </div>

      {proposal.summary && (
        <div
          className="prose prose-sm max-w-none"
          style={{ color: colors.text.secondary }}
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: colors.text.primary }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className="text-base font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p
                  className="mb-3 text-[13.5px] leading-[1.6]"
                  style={{ color: colors.text.secondary }}
                >
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul
                  className="list-disc list-inside mb-3 space-y-1"
                  style={{ color: colors.text.secondary }}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol
                  className="list-decimal list-inside mb-3 space-y-1"
                  style={{ color: colors.text.secondary }}
                >
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li style={{ color: colors.text.secondary }}>{children}</li>
              ),
              code: ({ children }) => (
                <code
                  className="px-1 py-0.5 rounded text-sm font-mono"
                  style={{
                    backgroundColor: `${colors.border.secondary}40`,
                    color: colors.text.primary,
                  }}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  className="p-3 rounded-lg overflow-x-auto mb-3"
                  style={{
                    backgroundColor: `${colors.border.secondary}20`,
                    color: colors.text.primary,
                  }}
                >
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-4 pl-4 mb-3 italic"
                  style={{
                    borderColor: colors.primary,
                    color: colors.text.secondary,
                  }}
                >
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                  style={{ color: colors.primary }}
                >
                  {children}
                </a>
              ),
            }}
          >
            {proposal.summary}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
