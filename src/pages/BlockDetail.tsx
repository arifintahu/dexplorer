import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Block, Coin } from '@cosmjs/stargate'
import { sha256 } from '@cosmjs/crypto'
import { toHex } from '@cosmjs/encoding'
import { Tx as TxData } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FiBox, FiChevronLeft, FiCopy } from 'react-icons/fi'
import { toast } from 'sonner'
import { useTheme } from '@/theme/ThemeProvider'
import { getBlock } from '@/rpc/query'
import { useClientStore } from '@/store/clientStore'
import { selectTransactions } from '@/store/streamSlice'
import { getTypeMsg, timeFromNow, trimHash } from '@/utils/helper'
import { getMessageTypePillStyle, getResultPillStyle } from '@/utils/pillStyle'

const TYPE_LABELS: Record<string, string> = {
  Transfer: 'IBC Transfer',
  WithdrawDelegatorReward: 'Withdraw Reward',
  Undelegate: 'Begin Unbonding',
}

const formatUtcTimestamp = (value: Date | string | undefined) => {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC')
}

const asHex = (value: string | Uint8Array | null | undefined) => {
  if (!value) return ''
  return typeof value === 'string'
    ? value.toUpperCase()
    : toHex(value).toUpperCase()
}

const formatFee = (coins: readonly Coin[] | undefined) => {
  const fee = coins?.[0]
  if (!fee) return '—'

  const amount = Number(fee.amount)
  const denom = fee.denom.startsWith('u')
    ? fee.denom.slice(1).toUpperCase()
    : fee.denom.toUpperCase()

  if (!Number.isFinite(amount)) return `— ${denom}`

  const normalized = fee.denom.startsWith('u') ? amount / 1e6 : amount
  return `${normalized.toFixed(normalized < 1 ? 4 : 2)} ${denom}`
}

const formatGas = (value: number) => (value > 0 ? value.toLocaleString() : '—')

const BlockDetail: React.FC = () => {
  const { height } = useParams<{ height: string }>()
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)
  const streamedTransactions = useSelector(selectTransactions)
  const [block, setBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tmClient || !height) return

    setLoading(true)
    getBlock(tmClient, parseInt(height, 10))
      .then((blockData) => {
        setBlock(blockData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching block:', error)
        toast.error('Failed to fetch block data')
        setLoading(false)
      })
  }, [height, tmClient])

  const txLookup = useMemo(
    () =>
      new Map(
        streamedTransactions.map((tx) => [tx.hash.toUpperCase(), tx] as const)
      ),
    [streamedTransactions]
  )

  const txRows = useMemo(() => {
    if (!block?.txs.length) return []

    return block.txs.map((rawTx) => {
      const data = TxData.decode(rawTx)
      const hash = toHex(sha256(rawTx)).toUpperCase()
      const streamTx = txLookup.get(hash)
      const rawType = data.body?.messages?.[0]?.typeUrl
        ? getTypeMsg(data.body.messages[0].typeUrl)
        : 'Unknown'

      return {
        fee: formatFee(data.authInfo?.fee?.amount),
        gasUsed: Number(streamTx?.result.gasUsed || 0),
        gasWanted: Number(streamTx?.result.gasWanted || 0),
        hash,
        status: streamTx?.result.code === 0 || !streamTx ? 'Success' : 'Failed',
        type: TYPE_LABELS[rawType] || rawType,
      }
    })
  }, [block, txLookup])

  const details = useMemo(() => {
    if (!block) return null

    const header = block.header as unknown as {
      appHash?: string | Uint8Array
      proposerAddress?: string | Uint8Array
      time?: string | Date
    }
    const blockHash =
      typeof block.id === 'string' ? block.id.toUpperCase() : '—'
    const proposer = asHex(header.proposerAddress)
    const gasUsed = txRows.reduce((sum, tx) => sum + tx.gasUsed, 0)
    const gasWanted = txRows.reduce((sum, tx) => sum + tx.gasWanted, 0)

    return {
      appHash: asHex(header.appHash),
      blockHash,
      proposer,
      proposerInitial: trimHash(proposer || 'NA', 2)
        .replace('.', '')
        .slice(0, 2),
      timestamp: formatUtcTimestamp(header.time),
      txCount: txRows.length,
      gasUsed,
      gasWanted,
    }
  }, [block, txRows])

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <p style={{ color: colors.text.secondary }}>Loading block data...</p>
      </div>
    )
  }

  if (!block || !details) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <p style={{ color: colors.text.secondary }}>Block not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <Link
        to="/blocks"
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: colors.text.secondary }}
      >
        <FiChevronLeft className="h-4 w-4" />
        Back to blocks
      </Link>

      <div className="panel-surface rounded-[14px] px-6 py-[22px]">
        <div className="mb-[18px] flex flex-wrap items-center gap-[13px]">
          <div
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px]"
            style={{
              backgroundColor: `${colors.primary}14`,
              color: colors.primary,
            }}
          >
            <FiBox className="h-5 w-5" />
          </div>

          <div className="flex flex-col leading-[1.25]">
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: colors.text.tertiary }}
            >
              Block
            </span>
            <span
              className="font-mono text-[22px] font-semibold"
              style={{ color: colors.text.primary }}
            >
              {Number(height).toLocaleString()}
            </span>
          </div>

          <div className="flex-1" />

          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${colors.status.success}14`,
              border: `1px solid ${colors.status.success}30`,
              color: colors.status.success,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: colors.status.success }}
            />
            Finalized
          </span>
        </div>

        <div
          className="grid gap-px overflow-hidden rounded-[11px] border md:grid-cols-2"
          style={{
            backgroundColor: colors.border.primary,
            borderColor: colors.border.primary,
          }}
        >
          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className="text-[11.5px]"
                style={{ color: colors.text.tertiary }}
              >
                Block Hash
              </span>
              <button
                type="button"
                onClick={() => void copyText(details.blockHash, 'Block hash')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: colors.primary }}
              >
                <FiCopy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <span
              className="font-mono text-[13px] break-all"
              style={{ color: colors.text.primary }}
            >
              {details.blockHash}
            </span>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              Timestamp
            </span>
            <span
              className="text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {details.timestamp}
            </span>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              Proposer
            </span>
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                }}
              >
                {details.proposerInitial || 'NA'}
              </span>
              <span
                className="text-[13px]"
                style={{ color: colors.text.primary }}
              >
                {details.proposer ? trimHash(details.proposer, 14) : '—'}
              </span>
            </div>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              Transactions
            </span>
            <span
              className="font-mono text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {details.txCount}
            </span>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              Gas (used / wanted)
            </span>
            <span
              className="font-mono text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {formatGas(details.gasUsed)} / {formatGas(details.gasWanted)}
            </span>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              App Hash
            </span>
            <span
              className="font-mono text-[13px] break-all"
              style={{ color: colors.text.primary }}
            >
              {details.appHash || '—'}
            </span>
          </div>
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
          Transactions in this block
        </div>

        <div
          className="hidden gap-3 border-b px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] md:grid md:grid-cols-[minmax(0,1.6fr)_130px_100px_110px]"
          style={{
            borderColor: colors.border.primary,
            color: colors.text.tertiary,
          }}
        >
          <span>Tx Hash</span>
          <span>Type</span>
          <span>Result</span>
          <span className="text-right">Fee</span>
        </div>

        {txRows.map((tx) => (
          <div
            key={tx.hash}
            className="reference-table-row grid gap-3 border-b px-5 py-4 md:grid-cols-[minmax(0,1.6fr)_130px_100px_110px] md:items-center"
            style={{ borderColor: colors.border.primary }}
          >
            <Link
              to={`/txs/${tx.hash}`}
              className="truncate font-mono text-[12.5px]"
              style={{ color: colors.primary }}
            >
              {trimHash(tx.hash, 16)}
            </Link>
            <span
              className="reference-pill w-fit"
              style={getMessageTypePillStyle(tx.type, colors)}
            >
              {tx.type}
            </span>
            <span
              className="reference-pill w-fit"
              style={getResultPillStyle(tx.status === 'Success', colors)}
            >
              {tx.status}
            </span>
            <span
              className="font-mono text-[12.5px] md:text-right"
              style={{ color: colors.text.secondary }}
            >
              {tx.fee}
            </span>
          </div>
        ))}

        {txRows.length === 0 && (
          <div
            className="px-5 py-10 text-center text-sm"
            style={{ color: colors.text.secondary }}
          >
            No transactions in this block
          </div>
        )}
      </div>

      <div className="text-xs" style={{ color: colors.text.tertiary }}>
        Block time: {timeFromNow(String(block.header.time))}
      </div>
    </div>
  )
}

export default BlockDetail
