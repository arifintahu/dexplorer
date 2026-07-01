import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Block, Coin, IndexedTx } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FiActivity, FiChevronLeft, FiCopy } from 'react-icons/fi'
import { toast } from 'sonner'
import { useTheme } from '@/theme/ThemeProvider'
import { getBlock, getTx } from '@/rpc/query'
import { useClientStore } from '@/store/clientStore'
import { decodeMsg } from '@/encoding'
import { selectTransactions } from '@/store/streamSlice'
import { getTypeMsg, isBech32Address } from '@/utils/helper'
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

const stringifyField = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const TransactionDetail: React.FC = () => {
  const { hash } = useParams<{ hash: string }>()
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)
  const streamedTransactions = useSelector(selectTransactions)
  const [tx, setTx] = useState<IndexedTx | null>(null)
  const [txData, setTxData] = useState<Tx | null>(null)
  const [block, setBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tmClient || !hash) return

    setLoading(true)
    getTx(tmClient, hash)
      .then((result) => {
        setTx(result)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching transaction:', error)
        toast.error('Failed to fetch transaction data')
        setLoading(false)
      })
  }, [hash, tmClient])

  useEffect(() => {
    if (!tmClient || !tx?.height) return

    getBlock(tmClient, tx.height)
      .then(setBlock)
      .catch((error) => {
        console.error('Error fetching block:', error)
      })
  }, [tmClient, tx])

  useEffect(() => {
    if (!tx?.tx) return

    try {
      setTxData(Tx.decode(tx.tx))
    } catch (error) {
      console.error('Error decoding transaction:', error)
    }
  }, [tx])

  const streamedTransaction = useMemo(
    () =>
      streamedTransactions.find(
        (item) => item.hash.toUpperCase() === hash?.toUpperCase()
      ),
    [hash, streamedTransactions]
  )

  const txMeta = useMemo(() => {
    if (!txData || !tx) return null

    const rawType = txData.body?.messages?.[0]?.typeUrl
      ? getTypeMsg(txData.body.messages[0].typeUrl)
      : 'Unknown'

    return {
      fee: formatFee(txData.authInfo?.fee?.amount),
      gasUsed: streamedTransaction?.result.gasUsed || String(tx.gasUsed || '—'),
      gasWanted: streamedTransaction?.result.gasWanted || '—',
      memo: txData.body?.memo || '—',
      status: tx.code === 0 ? 'Success' : 'Failed',
      type: TYPE_LABELS[rawType] || rawType,
    }
  }, [streamedTransaction, tx, txData])

  const messageRows = useMemo(() => {
    if (!txData?.body?.messages.length) return []

    return txData.body.messages.map((message) => {
      const decoded = decodeMsg(message.typeUrl, message.value)
      const fields = Object.entries(decoded.data || {}).map(([key, value]) => ({
        key,
        value,
      }))

      return {
        fields,
        type: getTypeMsg(decoded.typeUrl),
        typeUrl: decoded.typeUrl,
      }
    })
  }, [txData])

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <p style={{ color: colors.text.secondary }}>
          Loading transaction data...
        </p>
      </div>
    )
  }

  if (!tx || !txData || !txMeta) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <p style={{ color: colors.text.secondary }}>Transaction not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <Link
        to="/txs"
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: colors.text.secondary }}
      >
        <FiChevronLeft className="h-4 w-4" />
        Back to transactions
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
            <FiActivity className="h-5 w-5" />
          </div>

          <div className="flex flex-col gap-[5px] leading-[1.2]">
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: colors.text.tertiary }}
            >
              Transaction
            </span>
            <div>
              <span
                className="reference-pill"
                style={getMessageTypePillStyle(txMeta.type, colors)}
              >
                {txMeta.type}
              </span>
            </div>
          </div>

          <div className="flex-1" />

          <span
            className="reference-pill"
            style={getResultPillStyle(txMeta.status === 'Success', colors)}
          >
            {txMeta.status}
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
            className="flex flex-col gap-1 px-[18px] py-[14px] md:col-span-2"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className="text-[11.5px]"
                style={{ color: colors.text.tertiary }}
              >
                Transaction Hash
              </span>
              <button
                type="button"
                onClick={() => void copyText(hash || '', 'Transaction hash')}
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
              {hash?.toUpperCase()}
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
              Height
            </span>
            <Link
              to={`/blocks/${tx.height}`}
              className="font-mono text-[13px]"
              style={{ color: colors.primary }}
            >
              {Number(tx.height).toLocaleString()}
            </Link>
          </div>

          <div
            className="flex flex-col gap-1 px-[18px] py-[14px]"
            style={{ backgroundColor: colors.surface }}
          >
            <span
              className="text-[11.5px]"
              style={{ color: colors.text.tertiary }}
            >
              Chain ID
            </span>
            <span
              className="font-mono text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {block?.header.chainId || '—'}
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
              Time
            </span>
            <span
              className="text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {formatUtcTimestamp(block?.header.time)}
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
              Fee
            </span>
            <span
              className="font-mono text-[13px]"
              style={{ color: colors.text.primary }}
            >
              {txMeta.fee}
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
              {txMeta.gasUsed} / {txMeta.gasWanted}
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
              Memo
            </span>
            <span
              className="text-[13px]"
              style={{ color: colors.text.tertiary }}
            >
              {txMeta.memo}
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
          Messages ({messageRows.length})
        </div>

        <div className="px-5 py-[18px]">
          <div
            className="rounded-[11px] border px-[18px] py-4"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border.primary,
            }}
          >
            {messageRows.map((message, messageIndex) => (
              <div key={`${message.typeUrl}-${messageIndex}`}>
                <div className="mb-2 flex flex-wrap items-center gap-[10px]">
                  <span
                    className="reference-pill"
                    style={getMessageTypePillStyle(message.type, colors)}
                  >
                    {message.type}
                  </span>
                  <span
                    className="font-mono text-[11.5px]"
                    style={{ color: colors.text.tertiary }}
                  >
                    {message.typeUrl}
                  </span>
                </div>

                {message.fields.map((field, fieldIndex) => (
                  <div
                    key={`${field.key}-${fieldIndex}`}
                    className="flex flex-col justify-between gap-2 border-t py-[9px] md:flex-row md:items-start md:gap-[18px]"
                    style={{ borderColor: colors.border.primary }}
                  >
                    <span
                      className="text-[12.5px]"
                      style={{ color: colors.text.secondary }}
                    >
                      {field.key}
                    </span>
                    <div
                      className="font-mono text-[12.5px] break-all md:max-w-[70%] md:text-right"
                      style={{ color: colors.text.primary }}
                    >
                      {typeof field.value === 'string' &&
                      isBech32Address(field.value) ? (
                        <Link
                          to={`/accounts/${field.value}`}
                          style={{ color: colors.primary }}
                        >
                          {field.value}
                        </Link>
                      ) : (
                        stringifyField(field.value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {messageRows.length === 0 && (
              <div className="text-sm" style={{ color: colors.text.secondary }}>
                No decoded messages available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail
