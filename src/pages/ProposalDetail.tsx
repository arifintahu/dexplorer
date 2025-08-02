import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiFileText,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
} from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import { useTheme } from '@/theme/ThemeProvider'
import { selectTmClient } from '@/store/connectSlice'
import { queryProposalById } from '@/rpc/abci'
import { displayDate } from '@/utils/helper'
import { proposalStatusList } from '@/utils/constant'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tmClient && id) {
      setIsLoading(true)
      setError(null)
      queryProposalById(tmClient, parseInt(id))
        .then((response) => {
          if (response.proposal) {
            setProposal(response.proposal)
          } else {
            setError('Proposal not found')
          }
        })
        .catch((err) => {
          console.error('Error fetching proposal:', err)
          setError('Failed to fetch proposal details')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [tmClient, id])

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
        <span style={{ color: colors.text.primary }}>Proposal #{proposal.id.toString()}</span>
      </div>

      {/* Proposal Header */}
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

      {/* Proposal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposal Metadata */}
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
                  {proposal.totalDeposit[0].amount} {proposal.totalDeposit[0].denom}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Voting Results */}
        {proposal.finalTallyResult && (
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
              {(() => {
                const yesCount = Number(proposal.finalTallyResult.yesCount) || 0;
                const noCount = Number(proposal.finalTallyResult.noCount) || 0;
                const abstainCount = Number(proposal.finalTallyResult.abstainCount) || 0;
                const noWithVetoCount = Number(proposal.finalTallyResult.noWithVetoCount) || 0;
                const totalVotes = yesCount + noCount + abstainCount + noWithVetoCount;
                
                const calculatePercentage = (count: number) => {
                  return totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : '0.0';
                };
                
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
                ];
                
                return voteTypes.map((voteType, index) => (
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
                ));
              })()}
              
              {/* Total Votes Summary */}
              <div className="pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text.secondary, fontWeight: '600' }}>Total Votes:</span>
                  <span style={{ color: colors.text.primary, fontWeight: '700', fontSize: '1.125rem' }}>
                    {(Number(proposal.finalTallyResult.yesCount) + 
                      Number(proposal.finalTallyResult.noCount) + 
                      Number(proposal.finalTallyResult.abstainCount) + 
                      Number(proposal.finalTallyResult.noWithVetoCount)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {proposal.messages && proposal.messages.length > 0 && (
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
            Messages ({proposal.messages.length})
          </h3>
          <div className="space-y-4">
            {proposal.messages.map((message, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: colors.primary + '20',
                      color: colors.primary,
                    }}
                  >
                    {message.typeUrl}
                  </span>
                </div>
                <pre
                  className="text-sm overflow-x-auto"
                  style={{ color: colors.text.secondary }}
                >
                  {JSON.stringify(message.value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}