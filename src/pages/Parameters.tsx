import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiDollarSign,
  FiShield,
  FiUsers,
  FiCheckCircle,
  FiPieChart,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  selectMintParams,
  selectStakingParams,
  selectDistributionParams,
  selectSlashingParams,
  selectGovVotingParams,
  selectGovDepositParams,
  selectGovTallyParams,
  setMintParams,
  setStakingParams,
  setDistributionParams,
  setSlashingParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} from '@/store/paramsSlice'
import {
  queryMintParams,
  queryStakingParams,
  queryDistributionParams,
  querySlashingParams,
  queryGovParams,
} from '@/rpc/abci'
import { displayDurationSeconds, convertRateToPercent } from '@/utils/helper'
import { getConvertedAmount, formatAmount } from '@/utils/cosmos'
import { fromUtf8 } from '@cosmjs/encoding'
import { toast } from 'sonner'
import { useClientStore } from '@/store/clientStore'

const Parameters: React.FC = () => {
  const { colors } = useTheme()
  const dispatch = useDispatch()
  const tmClient = useClientStore((state) => state.tmClient)

  // Parameter states
  const mintParams = useSelector(selectMintParams)
  const stakingParams = useSelector(selectStakingParams)
  const distributionParams = useSelector(selectDistributionParams)
  const slashingParams = useSelector(selectSlashingParams)
  const govVotingParams = useSelector(selectGovVotingParams)
  const govDepositParams = useSelector(selectGovDepositParams)
  const govTallyParams = useSelector(selectGovTallyParams)

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    mint: false,
    staking: false,
    distribution: false,
    slashing: false,
    gov: false,
  })

  // Fetch parameters
  useEffect(() => {
    if (!tmClient) return

    // Fetch Mint Parameters
    if (!mintParams && !loadingStates.mint) {
      setLoadingStates((prev) => ({ ...prev, mint: true }))
      queryMintParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setMintParams(response.params))
          }
          setLoadingStates((prev) => ({ ...prev, mint: false }))
        })
        .catch((err) => {
          console.error('Failed to fetch mint params:', err)
          toast.error('Failed to fetch mint parameters')
          setLoadingStates((prev) => ({ ...prev, mint: false }))
        })
    }

    // Fetch Staking Parameters
    if (!stakingParams && !loadingStates.staking) {
      setLoadingStates((prev) => ({ ...prev, staking: true }))
      queryStakingParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setStakingParams(response.params))
          }
          setLoadingStates((prev) => ({ ...prev, staking: false }))
        })
        .catch((err) => {
          console.error('Failed to fetch staking params:', err)
          toast.error('Failed to fetch staking parameters')
          setLoadingStates((prev) => ({ ...prev, staking: false }))
        })
    }

    // Fetch Distribution Parameters
    if (!distributionParams && !loadingStates.distribution) {
      setLoadingStates((prev) => ({ ...prev, distribution: true }))
      queryDistributionParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setDistributionParams(response.params))
          }
          setLoadingStates((prev) => ({ ...prev, distribution: false }))
        })
        .catch((err) => {
          console.error('Failed to fetch distribution params:', err)
          toast.error('Failed to fetch distribution parameters')
          setLoadingStates((prev) => ({ ...prev, distribution: false }))
        })
    }

    // Fetch Slashing Parameters
    if (!slashingParams && !loadingStates.slashing) {
      setLoadingStates((prev) => ({ ...prev, slashing: true }))
      querySlashingParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setSlashingParams(response.params))
          }
          setLoadingStates((prev) => ({ ...prev, slashing: false }))
        })
        .catch((err) => {
          console.error('Failed to fetch slashing params:', err)
          toast.error('Failed to fetch slashing parameters')
          setLoadingStates((prev) => ({ ...prev, slashing: false }))
        })
    }

    // Fetch Governance Parameters
    if (
      (!govVotingParams || !govDepositParams || !govTallyParams) &&
      !loadingStates.gov
    ) {
      setLoadingStates((prev) => ({ ...prev, gov: true }))

      Promise.all([
        queryGovParams(tmClient, 'voting'),
        queryGovParams(tmClient, 'deposit'),
        queryGovParams(tmClient, 'tallying'),
      ])
        .then(([votingResponse, depositResponse, tallyResponse]) => {
          if (votingResponse.params)
            dispatch(setGovVotingParams(votingResponse.params))
          if (depositResponse.params)
            dispatch(setGovDepositParams(depositResponse.params))
          if (tallyResponse.params)
            dispatch(setGovTallyParams(tallyResponse.params))
          setLoadingStates((prev) => ({ ...prev, gov: false }))
        })
        .catch((err) => {
          console.error('Failed to fetch gov params:', err)
          toast.error('Failed to fetch governance parameters')
          setLoadingStates((prev) => ({ ...prev, gov: false }))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tmClient,
    mintParams,
    stakingParams,
    distributionParams,
    slashingParams,
    govVotingParams,
    govDepositParams,
    govTallyParams,
    dispatch,
  ])

  const ParameterCard: React.FC<{
    title: string
    module: string
    icon: React.ReactNode
    color: string
    isLoading: boolean
    children: React.ReactNode
  }> = ({ title, module, icon, color, isLoading, children }) => (
    <div className="reference-table-shell rounded-[14px]">
      <div
        className="flex items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: colors.border.primary }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: 'h-[17px] w-[17px]',
            style: { color },
          })}
        </div>
        <div className="flex flex-col leading-[1.25]">
          <span
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            {title}
          </span>
          <span
            className="font-mono text-[11px]"
            style={{ color: colors.text.tertiary }}
          >
            {module}
          </span>
        </div>
      </div>

      <div className="flex flex-col px-5 py-[10px]">
        {isLoading ? (
          <div className="flex flex-col">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2"
              >
                <div
                  className="h-3.5 w-28 animate-pulse rounded"
                  style={{ backgroundColor: colors.border.secondary }}
                />
                <div
                  className="h-5 w-16 animate-pulse rounded-[7px]"
                  style={{ backgroundColor: colors.border.secondary }}
                />
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )

  const ParameterItem: React.FC<{
    label: string
    value: string | number
    tooltip?: string
  }> = ({ label, value, tooltip }) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <span
        className="text-[13px]"
        style={{ color: colors.text.secondary }}
        title={tooltip}
      >
        {label}
      </span>
      <span
        className="font-mono text-[12.5px] font-medium rounded-[7px] px-[10px] py-[3px]"
        style={{
          color: colors.text.primary,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        {value}
      </span>
    </div>
  )

  return (
    <div className="flex flex-col gap-[18px]">
      <p className="text-sm" style={{ color: colors.text.secondary }}>
        Network parameters governing staking, governance, minting, and slashing
        rules on this chain.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Mint Parameters */}
        <ParameterCard
          title="Mint Parameters"
          module="x/mint"
          icon={<FiDollarSign />}
          color={colors.status.success}
          isLoading={loadingStates.mint}
        >
          <ParameterItem
            label="Mint Denom"
            value={mintParams?.mintDenom || 'N/A'}
            tooltip="The denomination of the minted token"
          />
          <ParameterItem
            label="Inflation Rate Change"
            value={
              mintParams
                ? convertRateToPercent(mintParams.inflationRateChange)
                : 'N/A'
            }
            tooltip="Maximum annual change in inflation rate"
          />
          <ParameterItem
            label="Inflation Max"
            value={
              mintParams ? convertRateToPercent(mintParams.inflationMax) : 'N/A'
            }
            tooltip="Maximum inflation rate"
          />
          <ParameterItem
            label="Inflation Min"
            value={
              mintParams ? convertRateToPercent(mintParams.inflationMin) : 'N/A'
            }
            tooltip="Minimum inflation rate"
          />
          <ParameterItem
            label="Goal Bonded"
            value={
              mintParams ? convertRateToPercent(mintParams.goalBonded) : 'N/A'
            }
            tooltip="Target percentage of total supply that should be bonded"
          />
          <ParameterItem
            label="Blocks per Year"
            value={
              mintParams?.blocksPerYear
                ? Number(mintParams.blocksPerYear).toLocaleString()
                : 'N/A'
            }
            tooltip="Expected number of blocks per year"
          />
        </ParameterCard>

        {/* Staking Parameters */}
        <ParameterCard
          title="Staking Parameters"
          module="x/staking"
          icon={<FiShield />}
          color={colors.status.info}
          isLoading={loadingStates.staking}
        >
          <ParameterItem
            label="Unbonding Time"
            value={
              stakingParams
                ? displayDurationSeconds(
                    Number(stakingParams.unbondingTime?.seconds)
                  )
                : 'N/A'
            }
            tooltip="Time required to unbond staked tokens"
          />
          <ParameterItem
            label="Max Validators"
            value={
              stakingParams?.maxValidators
                ? Number(stakingParams.maxValidators)
                : 'N/A'
            }
            tooltip="Maximum number of active validators"
          />
          <ParameterItem
            label="Max Entries"
            value={
              stakingParams?.maxEntries
                ? Number(stakingParams.maxEntries)
                : 'N/A'
            }
            tooltip="Maximum number of unbonding delegations or redelegations"
          />
          <ParameterItem
            label="Historical Entries"
            value={
              stakingParams?.historicalEntries
                ? Number(stakingParams.historicalEntries)
                : 'N/A'
            }
            tooltip="Number of historical entries to persist"
          />
          <ParameterItem
            label="Bond Denom"
            value={stakingParams?.bondDenom || 'N/A'}
            tooltip="Denomination used for staking"
          />
        </ParameterCard>

        {/* Distribution Parameters */}
        <ParameterCard
          title="Distribution Parameters"
          module="x/distribution"
          icon={<FiPieChart />}
          color={colors.status.warning}
          isLoading={loadingStates.distribution}
        >
          <ParameterItem
            label="Community Tax"
            value={
              distributionParams
                ? convertRateToPercent(distributionParams.communityTax)
                : 'N/A'
            }
            tooltip="Percentage of inflation that goes to community pool"
          />
          <ParameterItem
            label="Base Proposer Reward"
            value={
              distributionParams
                ? convertRateToPercent(distributionParams.baseProposerReward)
                : 'N/A'
            }
            tooltip="Base reward for block proposer"
          />
          <ParameterItem
            label="Bonus Proposer Reward"
            value={
              distributionParams
                ? convertRateToPercent(distributionParams.bonusProposerReward)
                : 'N/A'
            }
            tooltip="Additional reward for block proposer based on precommits"
          />
          <ParameterItem
            label="Withdraw Address Enabled"
            value={distributionParams?.withdrawAddrEnabled ? 'Yes' : 'No'}
            tooltip="Whether delegators can set a different address to withdraw rewards"
          />
        </ParameterCard>

        {/* Slashing Parameters */}
        <ParameterCard
          title="Slashing Parameters"
          module="x/slashing"
          icon={<FiCheckCircle />}
          color={colors.status.error}
          isLoading={loadingStates.slashing}
        >
          <ParameterItem
            label="Signed Blocks Window"
            value={
              slashingParams?.signedBlocksWindow
                ? Number(slashingParams.signedBlocksWindow).toLocaleString()
                : 'N/A'
            }
            tooltip="Number of blocks to track for uptime"
          />
          <ParameterItem
            label="Min Signed Per Window"
            value={
              slashingParams?.minSignedPerWindow &&
              slashingParams.minSignedPerWindow instanceof Uint8Array
                ? convertRateToPercent(
                    fromUtf8(slashingParams.minSignedPerWindow)
                  )
                : 'N/A'
            }
            tooltip="Minimum percentage of blocks that must be signed"
          />
          <ParameterItem
            label="Downtime Jail Duration"
            value={
              slashingParams
                ? displayDurationSeconds(
                    Number(slashingParams.downtimeJailDuration?.seconds)
                  )
                : 'N/A'
            }
            tooltip="Duration a validator is jailed for downtime"
          />
          <ParameterItem
            label="Slash Fraction Double Sign"
            value={
              slashingParams?.slashFractionDoubleSign &&
              slashingParams.slashFractionDoubleSign instanceof Uint8Array
                ? convertRateToPercent(
                    fromUtf8(slashingParams.slashFractionDoubleSign)
                  )
                : 'N/A'
            }
            tooltip="Percentage slashed for double signing"
          />
          <ParameterItem
            label="Slash Fraction Downtime"
            value={
              slashingParams?.slashFractionDowntime &&
              slashingParams.slashFractionDowntime instanceof Uint8Array
                ? convertRateToPercent(
                    fromUtf8(slashingParams.slashFractionDowntime)
                  )
                : 'N/A'
            }
            tooltip="Percentage slashed for downtime"
          />
        </ParameterCard>

        {/* Governance Parameters */}
        <ParameterCard
          title="Governance Parameters"
          module="x/gov"
          icon={<FiUsers />}
          color={colors.primary}
          isLoading={loadingStates.gov}
        >
          <ParameterItem
            label="Voting Period"
            value={
              govVotingParams
                ? displayDurationSeconds(
                    Number(govVotingParams.votingPeriod?.seconds)
                  )
                : 'N/A'
            }
            tooltip="Duration of the voting period for proposals"
          />
          <ParameterItem
            label="Min Deposit"
            value={
              govDepositParams?.minDeposit?.[0]
                ? (() => {
                    const converted = getConvertedAmount(
                      govDepositParams.minDeposit[0].amount,
                      govDepositParams.minDeposit[0].denom
                    )
                    return `${formatAmount(converted.converted)} ${converted.base.toUpperCase()}`
                  })()
                : 'N/A'
            }
            tooltip="Minimum deposit required to submit a proposal"
          />
          <ParameterItem
            label="Max Deposit Period"
            value={
              govDepositParams
                ? displayDurationSeconds(
                    Number(govDepositParams.maxDepositPeriod?.seconds)
                  )
                : 'N/A'
            }
            tooltip="Maximum period for deposits on a proposal"
          />
          <ParameterItem
            label="Quorum"
            value={
              govTallyParams?.quorum
                ? (parseFloat(govTallyParams.quorum) * 100).toFixed(2) + '%'
                : 'N/A'
            }
            tooltip="Minimum percentage of voting power that must participate"
          />
          <ParameterItem
            label="Threshold"
            value={
              govTallyParams?.threshold
                ? (parseFloat(govTallyParams.threshold) * 100).toFixed(2) + '%'
                : 'N/A'
            }
            tooltip="Minimum percentage of Yes votes for proposal to pass"
          />
          <ParameterItem
            label="Veto Threshold"
            value={
              govTallyParams?.vetoThreshold
                ? (parseFloat(govTallyParams.vetoThreshold) * 100).toFixed(2) +
                  '%'
                : 'N/A'
            }
            tooltip="Percentage of NoWithVeto votes needed to veto a proposal"
          />
        </ParameterCard>
      </div>
    </div>
  )
}

export default Parameters
