import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiChevronLeft,
  FiShield,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from 'react-icons/fi'
import { toHex } from '@cosmjs/encoding'
import { useTheme } from '@/theme/ThemeProvider'
import {
  queryActiveValidators,
  queryStakingPool,
  querySlashingParams,
  querySigningInfo,
} from '@/rpc/abci'
import { useClientStore } from '@/store/clientStore'
import {
  convertRateToPercent,
  convertVotingPower,
  pubkeyToValconsAddress,
} from '@/utils/helper'
import ValidatorIcon from '@/components/ValidatorIcon'
import CopyText from '@/components/ui/CopyText'

type ValidatorDetail = {
  moniker: string
  identity: string
  website: string
  details: string
  status: number
  tokens: string
  commission: string
  operatorAddress: string
  minSelfDelegation: string
  delegatorShares: string
  unbondingHeight: string
  pubkey: string | null
  uptime: string | null
}

const formatUptime = (
  missedBlocksCounter: bigint,
  signedBlocksWindow: bigint
): string | null => {
  if (signedBlocksWindow <= 0n) return null
  const percent =
    (1 - Number(missedBlocksCounter) / Number(signedBlocksWindow)) * 100
  return `${percent.toFixed(2)}%`
}

const ValidatorDetail: React.FC = () => {
  const { identity } = useParams<{ identity: string }>()
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)

  const [validator, setValidator] = useState<ValidatorDetail | null>(null)
  const [poolTotal, setPoolTotal] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keybaseUsername, setKeybaseUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!tmClient || !identity) return

    const fetchValidator = async () => {
      setLoading(true)
      setError(null)

      try {
        const [validatorsResponse, poolResponse] = await Promise.all([
          queryActiveValidators(tmClient, 0, 100),
          queryStakingPool(tmClient),
        ])

        const pool = poolResponse.pool?.bondedTokens || '0'
        setPoolTotal(pool)

        // Find the validator by identity (keybase identity), falling back to moniker
        const foundValidator = validatorsResponse.validators.find(
          (v) => v.description?.identity === decodeURIComponent(identity)
        )
        const resolvedValidator =
          foundValidator ||
          validatorsResponse.validators.find(
            (v) => v.description?.moniker === decodeURIComponent(identity)
          )

        if (!resolvedValidator) {
          setError('Validator not found')
        } else {
          // Uptime relies on the slashing module's SigningInfo query, which
          // some nodes prune or reject for jailed/unbonded validators. Fetch
          // it independently so a failure here doesn't break the rest of the page.
          let uptime: string | null = null
          try {
            const valconsAddress = pubkeyToValconsAddress(
              resolvedValidator.consensusPubkey,
              resolvedValidator.operatorAddress
            )
            if (valconsAddress) {
              const [signingInfoResponse, slashingParamsResponse] =
                await Promise.all([
                  querySigningInfo(tmClient, valconsAddress),
                  querySlashingParams(tmClient),
                ])
              uptime = formatUptime(
                signingInfoResponse.valSigningInfo.missedBlocksCounter,
                slashingParamsResponse.params?.signedBlocksWindow ?? 0n
              )
            }
          } catch (uptimeErr) {
            console.error('Failed to fetch validator uptime:', uptimeErr)
          }

          setValidator({
            moniker: resolvedValidator.description?.moniker || 'Unknown',
            identity: resolvedValidator.description?.identity || '',
            website: resolvedValidator.description?.website || '',
            details: resolvedValidator.description?.details || '',
            status: resolvedValidator.status,
            tokens: resolvedValidator.tokens,
            commission: convertRateToPercent(
              resolvedValidator.commission?.commissionRates?.rate
            ),
            operatorAddress: resolvedValidator.operatorAddress || '',
            minSelfDelegation: resolvedValidator.minSelfDelegation || '1',
            delegatorShares: resolvedValidator.delegatorShares || '0',
            unbondingHeight:
              resolvedValidator.unbondingHeight?.toString() || '0',
            pubkey: resolvedValidator.consensusPubkey?.value
              ? toHex(resolvedValidator.consensusPubkey.value)
              : null,
            uptime,
          })
        }
      } catch (err) {
        console.error('Failed to fetch validator:', err)
        setError('Failed to load validator details')
      } finally {
        setLoading(false)
      }
    }

    fetchValidator()
  }, [tmClient, identity])

  // Resolve Keybase identity to username
  useEffect(() => {
    if (!validator?.identity) return

    let isMounted = true
    const resolveUsername = async () => {
      try {
        const res = await fetch(
          `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${validator.identity}&fields=basics`
        )
        const data = await res.json()
        if (isMounted && data?.them?.[0]?.basics?.username) {
          setKeybaseUsername(data.them[0].basics.username)
        }
      } catch {
        // Keybase API unavailable, show identity as plain text
      }
    }
    resolveUsername()
    return () => {
      isMounted = false
    }
  }, [validator?.identity])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <FiLoader
          className="h-8 w-8 animate-spin"
          style={{ color: colors.primary }}
        />
      </div>
    )
  }

  if (error || !validator) {
    return (
      <div className="flex flex-col gap-[18px]">
        <Link
          to="/validators"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: colors.text.secondary }}
        >
          <FiChevronLeft className="h-4 w-4" />
          Back to validators
        </Link>

        <div className="panel-surface rounded-[14px] p-12 text-center">
          <FiXCircle
            className="mx-auto mb-4 h-16 w-16"
            style={{ color: colors.status.error }}
          />
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: colors.text.primary }}
          >
            {error || 'Validator Not Found'}
          </h2>
          <p className="mb-6" style={{ color: colors.text.secondary }}>
            The validator you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <Link
            to="/validators"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            Back to Validators
          </Link>
        </div>
      </div>
    )
  }

  const isActive = validator.status === 3
  const votingPowerPercent =
    poolTotal !== '0'
      ? ((Number(validator.tokens) / Number(poolTotal)) * 100).toFixed(2)
      : '0'

  return (
    <div className="flex flex-col gap-[18px]">
      <Link
        to="/validators"
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: colors.text.secondary }}
      >
        <FiChevronLeft className="h-4 w-4" />
        Back to validators
      </Link>

      {/* Header */}
      <div className="panel-surface flex flex-col gap-[14px] rounded-[14px] px-6 py-[22px]">
        <div className="flex flex-wrap items-start gap-[15px]">
          <ValidatorIcon
            moniker={validator.moniker}
            identity={validator.identity}
            size="lg"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="flex flex-wrap items-center gap-[11px]">
              <span
                className="text-[21px] font-semibold tracking-[-0.01em]"
                style={{ color: colors.text.primary }}
              >
                {validator.moniker}
              </span>
              <span
                className="reference-pill"
                style={{
                  backgroundColor: isActive
                    ? `${colors.status.success}20`
                    : `${colors.status.error}20`,
                  color: isActive ? colors.status.success : colors.status.error,
                }}
              >
                {isActive ? (
                  <>
                    <FiCheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <FiXCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </>
                )}
              </span>
            </div>
            {validator.identity && (
              <div className="flex flex-wrap items-center gap-2">
                <CopyText
                  text={validator.identity}
                  className="font-mono text-[12px]"
                  style={{ color: colors.text.tertiary }}
                />
              </div>
            )}
            {validator.website && (
              <a
                href={validator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] hover:underline"
                style={{ color: colors.primary }}
              >
                {validator.website}
              </a>
            )}
          </div>
        </div>
        {validator.details && (
          <p
            className="text-[13.5px] leading-[1.55]"
            style={{ color: colors.text.secondary }}
          >
            {validator.details}
          </p>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="panel-surface flex flex-col gap-[7px] rounded-[14px] px-[19px] py-[17px]">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: colors.text.tertiary }}
          >
            Voting Power
          </span>
          <span
            className="font-mono text-[20px] font-semibold"
            style={{ color: colors.text.primary }}
          >
            {convertVotingPower(validator.tokens)}
          </span>
          <span
            className="text-[11.5px]"
            style={{ color: colors.text.secondary }}
          >
            {votingPowerPercent}% of bonded
          </span>
        </div>

        <div className="panel-surface flex flex-col gap-[7px] rounded-[14px] px-[19px] py-[17px]">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: colors.text.tertiary }}
          >
            Commission
          </span>
          <span
            className="font-mono text-[20px] font-semibold"
            style={{ color: colors.text.primary }}
          >
            {validator.commission}
          </span>
          <span
            className="text-[11.5px]"
            style={{ color: colors.text.secondary }}
          >
            Commission rate
          </span>
        </div>

        <div className="panel-surface flex flex-col gap-[7px] rounded-[14px] px-[19px] py-[17px]">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: colors.text.tertiary }}
          >
            Uptime
          </span>
          <span
            className="font-mono text-[20px] font-semibold"
            style={{ color: colors.text.primary }}
          >
            {validator.uptime ?? 'N/A'}
          </span>
          <span
            className="text-[11.5px]"
            style={{ color: colors.text.secondary }}
          >
            Signed blocks
          </span>
        </div>

        <div className="panel-surface flex flex-col gap-[7px] rounded-[14px] px-[19px] py-[17px]">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: colors.text.tertiary }}
          >
            Status
          </span>
          <span
            className="text-[20px] font-semibold"
            style={{ color: colors.text.primary }}
          >
            {isActive ? 'Bonded' : 'Unbonded'}
          </span>
          <span
            className="text-[11.5px]"
            style={{ color: colors.text.secondary }}
          >
            Validator status
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="reference-table-shell rounded-[14px]">
          <div
            className="border-b px-5 py-[15px] text-[14px] font-semibold"
            style={{
              borderColor: colors.border.primary,
              color: colors.text.primary,
            }}
          >
            Validator Information
          </div>
          <div
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: colors.border.primary }}
          >
            <span
              className="text-[12.5px]"
              style={{ color: colors.text.secondary }}
            >
              Delegator Shares
            </span>
            <span
              className="font-mono text-[12.5px]"
              style={{ color: colors.text.primary }}
            >
              {convertVotingPower(validator.delegatorShares)}
            </span>
          </div>
          <div
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: colors.border.primary }}
          >
            <span
              className="text-[12.5px]"
              style={{ color: colors.text.secondary }}
            >
              Min Self Delegation
            </span>
            <span
              className="font-mono text-[12.5px]"
              style={{ color: colors.text.primary }}
            >
              {validator.minSelfDelegation}
            </span>
          </div>
          <div
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: colors.border.primary }}
          >
            <span
              className="text-[12.5px]"
              style={{ color: colors.text.secondary }}
            >
              Unbonding Height
            </span>
            <span
              className="font-mono text-[12.5px]"
              style={{ color: colors.text.primary }}
            >
              {validator.unbondingHeight}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <span
              className="shrink-0 text-[12.5px]"
              style={{ color: colors.text.secondary }}
            >
              PubKey
            </span>
            {validator.pubkey ? (
              <CopyText
                text={validator.pubkey}
                displayText={validator.pubkey.substring(0, 20) + '...'}
                className="font-mono text-[12px] text-right"
                style={{ color: colors.text.primary }}
              />
            ) : (
              <span
                className="font-mono text-[12px]"
                style={{ color: colors.text.primary }}
              >
                N/A
              </span>
            )}
          </div>
        </div>

        <div className="reference-table-shell rounded-[14px]">
          <div
            className="border-b px-5 py-[15px] text-[14px] font-semibold"
            style={{
              borderColor: colors.border.primary,
              color: colors.text.primary,
            }}
          >
            Security
          </div>
          <div
            className="flex items-center gap-[10px] border-b px-5 py-[13px]"
            style={{ borderColor: colors.border.primary }}
          >
            <FiShield
              className="h-4 w-4"
              style={{ color: colors.status.success }}
            />
            <span
              className="text-[12.5px]"
              style={{ color: colors.text.secondary }}
            >
              Validator signed the last block
            </span>
          </div>
          {validator.identity && (
            <div className="flex items-start gap-[10px] px-5 py-[13px]">
              <FiKey
                className="mt-0.5 h-4 w-4"
                style={{ color: colors.status.info }}
              />
              <div className="flex flex-col gap-[2px]">
                <span
                  className="text-[12.5px]"
                  style={{ color: colors.text.secondary }}
                >
                  Keybase Identity
                </span>
                {keybaseUsername ? (
                  <a
                    href={`https://keybase.io/${encodeURIComponent(keybaseUsername)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12.5px] hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {keybaseUsername}
                  </a>
                ) : (
                  <span
                    className="font-mono text-[12.5px]"
                    style={{ color: colors.text.primary }}
                  >
                    {validator.identity}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delegator Info */}
      <div className="panel-surface flex flex-col gap-[6px] rounded-[14px] px-[22px] py-[18px]">
        <span
          className="text-[14px] font-semibold"
          style={{ color: colors.text.primary }}
        >
          Delegator Info
        </span>
        <p
          className="text-[13px] leading-[1.55]"
          style={{ color: colors.text.secondary }}
        >
          To delegate or undelegate to this validator, please use a wallet
          application like Keplr Wallet or Cosmostation. Dexplorer is a
          read-only block explorer.
        </p>
      </div>
    </div>
  )
}

export default ValidatorDetail
