import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { toHex } from '@cosmjs/encoding'
import { Coin } from '@cosmjs/stargate'
import { Tx as TxData } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { trimHash, getTypeMsg } from '@/utils/helper'
import { getResultPillStyle } from '@/utils/pillStyle'
import { FiUser } from 'react-icons/fi'
import { DecodedTx } from '@/hooks/useAccountData'
import { DecodeMsg } from '@/encoding'

interface TransactionListProps {
  decodedTxs: DecodedTx[]
  totalCount: number
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

export default function TransactionList({
  decodedTxs,
  totalCount,
}: TransactionListProps) {
  const { colors } = useTheme()

  const rows = useMemo(
    () =>
      decodedTxs.slice(0, 10).map(({ tx, msgs }) => {
        let fee = '—'
        try {
          fee = formatFee(TxData.decode(tx.tx).authInfo?.fee?.amount)
        } catch (error) {
          console.warn('Error decoding tx fee:', error)
        }
        return { tx, msgs, fee }
      }),
    [decodedTxs]
  )

  const renderTransactionMessages = (msgs: DecodeMsg[]) => {
    if (msgs.length === 0) return 'No messages'

    if (msgs.length === 1) {
      return (
        <span
          className="reference-pill w-fit"
          style={{
            backgroundColor: `${colors.primary}20`,
            color: colors.primary,
          }}
        >
          {getTypeMsg(msgs[0].typeUrl)}
        </span>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className="reference-pill w-fit"
          style={{
            backgroundColor: `${colors.primary}20`,
            color: colors.primary,
          }}
        >
          {getTypeMsg(msgs[0].typeUrl)}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: colors.primary }}
        >
          +{msgs.length - 1}
        </span>
      </div>
    )
  }

  return (
    <div className="reference-table-shell">
      <div
        className="border-b px-5 py-[15px] text-[14px] font-semibold"
        style={{
          borderColor: colors.border.primary,
          color: colors.text.primary,
        }}
      >
        Recent Transactions ({totalCount})
      </div>

      {rows.length > 0 ? (
        <>
          <div
            className="reference-table-header hidden gap-3 border-b px-5 py-3 md:grid md:grid-cols-[1.6fr_110px_130px_100px_110px]"
            style={{ borderColor: colors.border.primary }}
          >
            <span>Tx Hash</span>
            <span>Height</span>
            <span>Messages</span>
            <span>Result</span>
            <span className="text-right">Fee</span>
          </div>

          {rows.map(({ tx, msgs, fee }, index) => (
            <div
              key={index}
              className="reference-table-row grid gap-3 border-b px-5 py-4 md:grid-cols-[1.6fr_110px_130px_100px_110px] md:items-center"
              style={{ borderColor: colors.border.primary }}
            >
              <Link
                to={`/txs/${toHex(tx.hash)}`}
                className="truncate font-mono text-[12.5px]"
                style={{ color: colors.primary }}
              >
                {trimHash(tx.hash)}
              </Link>
              <Link
                to={`/blocks/${tx.height}`}
                className="font-mono text-[12.5px]"
                style={{ color: colors.text.secondary }}
              >
                {tx.height}
              </Link>
              <div>{renderTransactionMessages(msgs)}</div>
              <span
                className="reference-pill w-fit"
                style={getResultPillStyle(tx.result.code === 0, colors)}
              >
                {tx.result.code === 0 ? 'Success' : 'Failed'}
              </span>
              <span
                className="font-mono text-[12.5px] md:text-right"
                style={{ color: colors.text.primary }}
              >
                {fee}
              </span>
            </div>
          ))}
        </>
      ) : (
        <div className="px-5 py-10 text-center">
          <FiUser
            className="mx-auto mb-4 h-12 w-12"
            style={{ color: colors.text.tertiary }}
          />
          <p style={{ color: colors.text.secondary }}>No transactions found</p>
        </div>
      )}
    </div>
  )
}
