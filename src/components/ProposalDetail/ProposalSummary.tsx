import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import ReactMarkdown from 'react-markdown'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { proposalStatusList } from '@/utils/constant'

interface ProposalSummaryProps {
  proposal: Proposal
}

export default function ProposalSummary({ proposal }: ProposalSummaryProps) {
  const { colors } = useTheme()

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 3: // PASSED
        return <FiCheckCircle className="w-5 h-5" style={{ color: colors.status.success }} />
      case 4: // REJECTED
      case 5: // FAILED
        return <FiXCircle className="w-5 h-5" style={{ color: colors.status.error }} />
      case 1: // DEPOSIT_PERIOD
      case 2: // VOTING_PERIOD
        return <FiClock className="w-5 h-5" style={{ color: colors.status.warning }} />
      default:
        return <FiAlertCircle className="w-5 h-5" style={{ color: colors.text.tertiary }} />
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: // PASSED
        return colors.status.success
      case 4: // REJECTED
      case 5: // FAILED
        return colors.status.error
      case 1: // DEPOSIT_PERIOD
      case 2: // VOTING_PERIOD
        return colors.status.warning
      default:
        return colors.text.tertiary
    }
  }

  const getStatusText = (status: number) => {
    const statusItem = proposalStatusList.find(s => s.id === status)
    return statusItem ? statusItem.status : 'Unknown'
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              #{proposal.id.toString()} {proposal.title}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusIcon(proposal.status)}
              <span
                className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                style={{
                  backgroundColor: getStatusColor(proposal.status) + '20',
                  color: getStatusColor(proposal.status),
                }}
              >
                {getStatusText(proposal.status)}
              </span>
            </div>
          </div>
          {proposal.messages && proposal.messages.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: colors.primary + '20',
                  color: colors.primary,
                }}
              >
                {proposal.messages[0].typeUrl.split('.').pop()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Summary as Markdown */}
      {proposal.summary && (
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            Summary
          </h3>
          <div
            className="prose prose-sm max-w-none"
            style={{ color: colors.text.secondary }}
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium mb-2" style={{ color: colors.text.primary }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed" style={{ color: colors.text.secondary }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1" style={{ color: colors.text.secondary }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1" style={{ color: colors.text.secondary }}>
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
                      backgroundColor: colors.border.secondary + '40',
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
                      backgroundColor: colors.border.secondary + '20',
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
        </div>
      )}
    </div>
  )
}
