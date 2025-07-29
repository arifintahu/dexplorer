import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { selectTmClient } from '@/store/connectSlice'
import { queryProposals } from '@/rpc/abci'
import { getTypeMsg, displayDate } from '@/utils/helper'
import { proposalStatus, proposalStatusList } from '@/utils/constant'
import { toast } from 'sonner'

type Proposal = {
  id: bigint
  title: string
  types: string
  status: proposalStatus | undefined
  votingEnd: string
  description?: string
}

const Proposals: React.FC = () => {
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (tmClient) {
      setIsLoading(true)
      queryProposals(tmClient, page, perPage)
        .then((response) => {
          setTotal(Number(response.pagination?.total))
          const proposalsList: Proposal[] = response.proposals.map((val) => {
            const votingEnd = val.votingEndTime?.nanos
              ? new Date(
                  Number(val.votingEndTime?.seconds) * 1000
                ).toISOString()
              : null
            return {
              id: val.id,
              title: val.title,
              types: getTypeMsg(
                val.messages.length ? val.messages[0].typeUrl : ''
              ),
              status: proposalStatusList.find(
                (item) => item.id === Number(val.status.toString())
              ),
              votingEnd: votingEnd ? displayDate(votingEnd) : '',
              description: val.summary || val.title,
            }
          })
          setProposals(proposalsList)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error(err)
          toast.error('Failed to fetch proposals')
          setIsLoading(false)
        })
    }
  }, [tmClient, page, perPage])

  const getStatusIcon = (status: proposalStatus | undefined) => {
    if (!status) return <FiAlertCircle className="w-4 h-4" />

    switch (status.status.toLowerCase()) {
      case 'passed':
        return <FiCheckCircle className="w-4 h-4" />
      case 'rejected':
      case 'failed':
        return <FiXCircle className="w-4 h-4" />
      case 'voting':
      case 'deposit':
        return <FiClock className="w-4 h-4" />
      default:
        return <FiAlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: proposalStatus | undefined) => {
    if (!status) return colors.text.tertiary

    switch (status.status.toLowerCase()) {
      case 'passed':
        return colors.status.success
      case 'rejected':
      case 'failed':
        return colors.status.error
      case 'voting':
        return colors.status.info
      case 'deposit':
        return colors.status.warning
      default:
        return colors.text.tertiary
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Governance Proposals
        </h1>
        <div
          className="h-4 w-px"
          style={{ backgroundColor: colors.border.primary }}
        ></div>
        <Link
          to="/"
          className="flex items-center hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          <FiHome className="w-4 h-4" />
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.secondary }}>Proposals</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <FiFileText
                className="w-6 h-6"
                style={{ color: colors.primary }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {total}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Total Proposals
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.status.info + '20' }}
            >
              <FiUsers
                className="w-6 h-6"
                style={{ color: colors.status.info }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {
                  proposals.filter(
                    (p) => p.status?.status.toLowerCase() === 'voting'
                  ).length
                }
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Active Voting
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.status.success + '20' }}
            >
              <FiCheckCircle
                className="w-6 h-6"
                style={{ color: colors.status.success }}
              />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {
                  proposals.filter(
                    (p) => p.status?.status.toLowerCase() === 'passed'
                  ).length
                }
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Passed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            All Proposals
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Governance proposals and their current status
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse p-4 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: colors.border.secondary }}
                    ></div>
                    <div className="space-y-2">
                      <div
                        className="h-4 w-48 rounded"
                        style={{ backgroundColor: colors.border.secondary }}
                      ></div>
                      <div
                        className="h-3 w-32 rounded"
                        style={{ backgroundColor: colors.border.secondary }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className="h-6 w-20 rounded-full"
                    style={{ backgroundColor: colors.border.secondary }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <Link
                key={proposal.id.toString()}
                to={`/proposals/${proposal.id}`}
                className="block p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border.secondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.secondary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: colors.primary + '20' }}
                    >
                      <FiFileText
                        className="w-6 h-6"
                        style={{ color: colors.primary }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className="font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          #{proposal.id.toString()} {proposal.title}
                        </h3>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colors.primary + '20',
                            color: colors.primary,
                          }}
                        >
                          {proposal.types}
                        </span>
                      </div>
                      {proposal.description && (
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: colors.text.secondary }}
                        >
                          {proposal.description}
                        </p>
                      )}
                      {proposal.votingEnd && (
                        <div className="flex items-center gap-2 mt-2">
                          <FiClock
                            className="w-3 h-3"
                            style={{ color: colors.text.tertiary }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: colors.text.tertiary }}
                          >
                            Voting ends: {proposal.votingEnd}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(proposal.status)}
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        backgroundColor: getStatusColor(proposal.status) + '20',
                        color: getStatusColor(proposal.status),
                      }}
                    >
                      {proposal.status?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {proposals.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FiFileText
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  style={{ color: colors.text.tertiary }}
                />
                <p style={{ color: colors.text.secondary }}>
                  No proposals available
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.tertiary }}
                >
                  Governance proposals will appear here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between mt-6 pt-6"
            style={{ borderTop: `1px solid ${colors.border.secondary}` }}
          >
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Showing {page * perPage + 1} to{' '}
              {Math.min((page + 1) * perPage, total)} of {total} proposals
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  borderColor: colors.border.secondary,
                  backgroundColor: colors.background,
                  color: colors.text.primary,
                }}
              >
                Previous
              </button>
              <span
                className="px-3 py-1 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  borderColor: colors.border.secondary,
                  backgroundColor: colors.background,
                  color: colors.text.primary,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Proposals
