import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiShield, FiPercent } from 'react-icons/fi'
import {
  queryActiveValidators,
  queryValidators,
  queryStakingPool,
} from '@/rpc/abci'
import { convertRateToPercent, convertVotingPower } from '@/utils/helper'
import { useTheme } from '@/theme/ThemeProvider'
import { useClientStore } from '@/store/clientStore'
import ValidatorIcon from '@/components/ValidatorIcon'
import StatCard from '@/components/Home/StatCard'

type ValidatorData = {
  validator: string
  status: string
  votingPower: string
  votingPowerRaw: string
  totalBonded: string
  commission: string
  identity: string
}

const Validators: React.FC = () => {
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)
  const [page, setPage] = useState(0)
  const [perPage] = useState(10)
  const [totalValidator, setTotalValidator] = useState(0)
  const [totalActiveValidator, setTotalActiveValidator] = useState(0)
  const [data, setData] = useState<ValidatorData[]>([])

  useEffect(() => {
    if (tmClient) {
      Promise.all([
        queryActiveValidators(tmClient, page, perPage),
        queryStakingPool(tmClient),
      ])
        .then(([response, poolResponse]) => {
          setTotalActiveValidator(Number(response.pagination?.total))
          const poolTotal = poolResponse.pool?.bondedTokens || '0'

          const validatorData: ValidatorData[] = response.validators.map(
            (val) => {
              return {
                validator: val.description?.moniker ?? '',
                status: val.status === 3 ? 'Active' : 'Inactive',
                votingPower: convertVotingPower(val.tokens),
                votingPowerRaw: val.tokens,
                totalBonded: poolTotal,
                commission: convertRateToPercent(
                  val.commission?.commissionRates?.rate
                ),
                identity: val.description?.identity || '',
              }
            }
          )
          setData(validatorData)
        })
        .catch((error) => {
          console.error('Failed to fetch validators:', error)
        })
    }
  }, [tmClient, page, perPage])

  useEffect(() => {
    if (tmClient) {
      queryValidators(tmClient, page, perPage)
        .then((response) => {
          setTotalValidator(Number(response.pagination?.total))
        })
        .catch((error) => {
          console.error('Failed to fetch validators:', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmClient])

  const avgCommission =
    data.length > 0
      ? (
          data.reduce(
            (acc, v) => acc + parseFloat(v.commission.replace('%', '')),
            0
          ) / data.length
        ).toFixed(1) + '%'
      : '0%'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Active Validators"
          value={totalActiveValidator}
          icon={FiShield}
          subtitle="Currently bonded"
          index={0}
        />
        <StatCard
          title="Total Validators"
          value={totalValidator}
          icon={FiUsers}
          subtitle="Registered on chain"
          index={1}
        />
        <StatCard
          title="Avg Commission"
          value={avgCommission}
          icon={FiPercent}
          subtitle="Across active set"
          index={2}
        />
      </div>

      {tmClient ? (
        <div className="reference-table-shell">
          <div
            className="hidden gap-3 border-b px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] md:grid md:grid-cols-[44px_1.6fr_1.1fr_100px_84px]"
            style={{
              borderColor: colors.border.primary,
              color: colors.text.tertiary,
            }}
          >
            <span>#</span>
            <span>Validator</span>
            <span>Voting Power</span>
            <span>Commission</span>
            <span className="text-right">Status</span>
          </div>

          {data.map((v, index) => {
            const percentage =
              v.totalBonded && v.totalBonded !== '0'
                ? (Number(v.votingPowerRaw) / Number(v.totalBonded)) * 100
                : 0
            const isActive = v.status === 'Active'

            return (
              <Link
                key={`${v.identity || v.validator}-${index}`}
                to={`/validators/${encodeURIComponent(v.identity || v.validator)}`}
                className="reference-table-row grid gap-3 border-b px-5 py-4 md:grid-cols-[44px_1.6fr_1.1fr_100px_84px] md:items-center"
                style={{ borderColor: colors.border.primary }}
              >
                <span
                  className="font-mono text-[13px]"
                  style={{ color: colors.text.tertiary }}
                >
                  {page * perPage + index + 1}
                </span>

                <div className="flex min-w-0 items-center gap-2.5">
                  <ValidatorIcon
                    moniker={v.validator}
                    identity={v.identity}
                    size="md"
                  />
                  <span
                    className="truncate text-[13px] font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {v.validator}
                  </span>
                </div>

                <div className="flex flex-col gap-[5px]">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="font-mono text-[12px]"
                      style={{ color: colors.text.primary }}
                    >
                      {v.votingPower}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: colors.text.tertiary }}
                    >
                      {percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div
                    className="h-[5px] overflow-hidden rounded-[3px]"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  >
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                      }}
                    />
                  </div>
                </div>

                <span
                  className="text-[12.5px]"
                  style={{ color: colors.text.secondary }}
                >
                  {v.commission}
                </span>

                <span
                  className="reference-pill w-fit justify-self-end"
                  style={{
                    backgroundColor: isActive
                      ? `${colors.status.success}20`
                      : `${colors.status.error}20`,
                    color: isActive
                      ? colors.status.success
                      : colors.status.error,
                  }}
                >
                  {v.status}
                </span>
              </Link>
            )
          })}

          {data.length === 0 && (
            <div className="px-5 py-12 text-center">
              <FiUsers
                className="mx-auto mb-4 h-12 w-12 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No validators available
              </p>
            </div>
          )}

          <div
            className="flex items-center justify-between border-t px-5 py-[14px]"
            style={{ borderColor: colors.border.primary }}
          >
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              Showing {page * perPage + 1}–
              {Math.min((page + 1) * perPage, totalActiveValidator)} of{' '}
              {totalActiveValidator} validators
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
                disabled={(page + 1) * perPage >= totalActiveValidator}
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
      ) : (
        <div className="reference-table-shell px-5 py-12 text-center">
          <FiUsers
            className="mx-auto mb-4 h-12 w-12 opacity-50"
            style={{ color: colors.text.tertiary }}
          />
          <p style={{ color: colors.text.secondary }}>
            No connection to blockchain
          </p>
          <p className="mt-1 text-sm" style={{ color: colors.text.tertiary }}>
            Please connect to view validators
          </p>
        </div>
      )}
    </div>
  )
}

export default Validators
