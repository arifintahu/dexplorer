import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { queryProposals } from '@/rpc/abci'
import { getTypeMsg, displayDate } from '@/utils/helper'
import { proposalStatus, proposalStatusList } from '@/utils/constant'
import { toast } from 'sonner'
import { useClientStore } from '@/store/clientStore'
import { TallyResult } from 'cosmjs-types/cosmos/gov/v1/gov'
import StatCard from '@/components/Home/StatCard'

type Proposal = {
  id: bigint
  title: string
  types: string
  status: proposalStatus | undefined
  votingEnd: string
  description?: string
  finalTallyResult?: TallyResult
}

const Proposals: React.FC = () => {
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)
  const [page, setPage] = useState(0)
  const [perPage] = useState(10)
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
              finalTallyResult: val.finalTallyResult,
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

  const getStatusColor = (status: proposalStatus | undefined) => {
    if (!status) return colors.text.tertiary

    switch (status.status.toLowerCase()) {
      case 'passed':
        return colors.status.success
      case 'rejected':
      case 'failed':
        return colors.status.error
      case 'voting period':
        return colors.status.info
      case 'deposit period':
        return colors.status.warning
      default:
        return colors.text.tertiary
    }
  }

  const getTally = (proposal: Proposal) => {
    if (!proposal.finalTallyResult) return null

    const yesCount = Number(proposal.finalTallyResult.yesCount) || 0
    const noCount = Number(proposal.finalTallyResult.noCount) || 0
    const abstainCount = Number(proposal.finalTallyResult.abstainCount) || 0
    const noWithVetoCount =
      Number(proposal.finalTallyResult.noWithVetoCount) || 0
    const totalVotes = yesCount + noCount + abstainCount + noWithVetoCount

    if (totalVotes === 0) return null

    const pct = (count: number) => (count / totalVotes) * 100

    return {
      yes: pct(yesCount),
      no: pct(noCount),
      abstain: pct(abstainCount),
      veto: pct(noWithVetoCount),
    }
  }

  const activeVoting = proposals.filter(
    (p) => p.status?.status.toLowerCase() === 'voting period'
  ).length
  const passed = proposals.filter(
    (p) => p.status?.status.toLowerCase() === 'passed'
  ).length

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Proposals"
          value={total}
          icon={FiFileText}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Voting"
          value={activeVoting}
          icon={FiClock}
          iconColor={colors.status.info}
          isLoading={isLoading}
        />
        <StatCard
          title="Passed"
          value={passed}
          icon={FiCheckCircle}
          iconColor={colors.status.success}
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-[14px]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="panel-surface flex flex-col gap-[15px] rounded-[14px] px-[22px] py-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-10 animate-pulse rounded"
                  style={{ backgroundColor: colors.border.primary }}
                />
                <div
                  className="h-4 flex-1 animate-pulse rounded"
                  style={{ backgroundColor: colors.border.primary }}
                />
                <div
                  className="h-5 w-16 animate-pulse rounded-full"
                  style={{ backgroundColor: colors.border.primary }}
                />
              </div>
              <div
                className="h-[9px] w-full animate-pulse rounded-[5px]"
                style={{ backgroundColor: colors.border.primary }}
              />
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="panel-surface rounded-[14px] py-12 text-center">
          <FiFileText
            className="mx-auto mb-4 h-12 w-12 opacity-50"
            style={{ color: colors.text.tertiary }}
          />
          <p style={{ color: colors.text.secondary }}>No proposals available</p>
          <p className="mt-1 text-sm" style={{ color: colors.text.tertiary }}>
            Governance proposals will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[14px]">
          {proposals.map((proposal) => {
            const tally = getTally(proposal)
            const statusColor = getStatusColor(proposal.status)

            return (
              <Link
                key={proposal.id.toString()}
                to={`/proposals/${proposal.id}`}
                className="reference-table-row panel-surface flex cursor-pointer flex-col gap-[15px] rounded-[14px] px-[22px] py-5"
              >
                <div className="flex items-start gap-[14px]">
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{ color: colors.text.tertiary }}
                  >
                    #{proposal.id.toString()}
                  </span>
                  <span
                    className="flex-1 text-[15px] font-semibold leading-[1.35]"
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
                    {proposal.status?.status.toLowerCase() || 'unknown'}
                  </span>
                </div>

                {tally && (
                  <>
                    <div
                      className="flex h-[9px] overflow-hidden rounded-[5px]"
                      style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                      <div
                        style={{
                          width: `${tally.yes}%`,
                          backgroundColor: colors.status.success,
                        }}
                      />
                      <div
                        style={{
                          width: `${tally.no}%`,
                          backgroundColor: colors.status.error,
                        }}
                      />
                      <div
                        style={{
                          width: `${tally.abstain}%`,
                          backgroundColor: colors.text.tertiary,
                        }}
                      />
                      <div
                        style={{
                          width: `${tally.veto}%`,
                          backgroundColor: colors.status.warning,
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-[18px]">
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        <span
                          className="h-[9px] w-[9px] rounded-[2px]"
                          style={{ backgroundColor: colors.status.success }}
                        />
                        Yes {tally.yes.toFixed(1)}%
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        <span
                          className="h-[9px] w-[9px] rounded-[2px]"
                          style={{ backgroundColor: colors.status.error }}
                        />
                        No {tally.no.toFixed(1)}%
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        <span
                          className="h-[9px] w-[9px] rounded-[2px]"
                          style={{ backgroundColor: colors.text.tertiary }}
                        />
                        Abstain {tally.abstain.toFixed(1)}%
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        <span
                          className="h-[9px] w-[9px] rounded-[2px]"
                          style={{ backgroundColor: colors.status.warning }}
                        />
                        Veto {tally.veto.toFixed(1)}%
                      </span>
                      <div className="flex-1" />
                      {proposal.votingEnd && (
                        <span
                          className="text-xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          Voting ends {proposal.votingEnd}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </Link>
            )
          })}

          <div className="panel-surface flex items-center justify-between rounded-[14px] px-5 py-[14px]">
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              Showing {page * perPage + 1}–
              {Math.min((page + 1) * perPage, total)} of {total} proposals
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border.primary,
                  color: colors.text.tertiary,
                }}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={(page + 1) * perPage >= total}
                onClick={() => setPage(page + 1)}
                className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: `${colors.primary}18`,
                  borderColor: `${colors.primary}66`,
                  color: colors.primary,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Proposals
