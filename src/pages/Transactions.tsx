import React, { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fromHex } from '@cosmjs/encoding'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FiActivity } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { selectTransactions } from '@/store/streamSlice'
import { RootState } from '@/store'
import {
  getActionFromAttributes,
  getTypeMsg,
  timeFromNow,
  trimHash,
} from '@/utils/helper'
import { getMessageTypePillStyle, getResultPillStyle } from '@/utils/pillStyle'
import CopyText from '@/components/ui/CopyText'

type TxAttribute = {
  key: string
  value: string
  index?: boolean
}

type TxEvent = {
  type: string
  attributes: TxAttribute[]
}

const TYPE_LABELS: Record<string, string> = {
  Transfer: 'IBC Transfer',
  WithdrawDelegatorReward: 'Withdraw Reward',
  Undelegate: 'Begin Unbonding',
}

const Transactions: React.FC = () => {
  const { colors } = useTheme()
  const transactions = useSelector(selectTransactions)
  const { connectState } = useSelector((state: RootState) => state.connect)

  const getTransactionStatus = (
    result: { code: number } | null | undefined
  ): 'success' | 'failed' => {
    if (!result) return 'failed'
    return result.code === 0 ? 'success' : 'failed'
  }

  const getTxType = useCallback((events: TxEvent[] | undefined): string => {
    if (!events) return 'Unknown'

    const messages = events.filter(
      (event) =>
        event.type === 'message' &&
        event.attributes.some(
          (attribute) => attribute.key === 'action' && attribute.value
        )
    )

    if (!messages.length) {
      return 'Unknown'
    }

    const rawLabel = getTypeMsg(getActionFromAttributes(messages[0].attributes))
    return TYPE_LABELS[rawLabel] || rawLabel || 'Unknown'
  }, [])

  const getFeeDisplay = (txHex: string) => {
    try {
      const decoded = Tx.decode(fromHex(txHex))
      const fee = decoded.authInfo?.fee?.amount?.[0]
      if (!fee) return '—'

      const denom = fee.denom.startsWith('u')
        ? fee.denom.slice(1).toUpperCase()
        : fee.denom.toUpperCase()
      const amount = Number(fee.amount)

      if (!Number.isFinite(amount)) return `— ${denom}`

      const normalizedAmount = fee.denom.startsWith('u') ? amount / 1e6 : amount
      return `${normalizedAmount.toFixed(normalizedAmount < 1 ? 4 : 2)} ${denom}`
    } catch {
      return '—'
    }
  }

  const rows = useMemo(
    () =>
      transactions.slice(0, 50).map((tx) => ({
        ...tx,
        feeDisplay: getFeeDisplay(tx.tx),
        status: getTransactionStatus(tx.result),
        txType: getTxType(tx.result?.events),
      })),
    [transactions, getTxType]
  )

  return (
    <div className="space-y-5">
      <div className="reference-table-shell">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.primary }}
              >
                <th className="reference-table-header px-5 py-4 text-left">
                  Tx Hash
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Type
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Result
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Height
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Fee
                </th>
                <th className="reference-table-header px-5 py-4 text-right">
                  Age
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx, index) => (
                <tr
                  key={`${tx.hash}-${index}`}
                  className="reference-table-row border-b"
                  style={{ borderColor: colors.border.primary }}
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/txs/${tx.hash}`}
                      className="font-mono text-sm hover:opacity-70 transition-opacity"
                      style={{ color: colors.primary }}
                    >
                      <CopyText
                        text={tx.hash}
                        displayText={trimHash(tx.hash, 14)}
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      />
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="reference-pill"
                      style={getMessageTypePillStyle(tx.txType, colors)}
                    >
                      {tx.txType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="reference-pill"
                      style={getResultPillStyle(
                        tx.status === 'success',
                        colors
                      )}
                    >
                      {tx.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/blocks/${tx.height}`}
                      className="font-mono hover:opacity-70 transition-opacity"
                      style={{ color: colors.text.secondary }}
                    >
                      {Number(tx.height).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {tx.feeDisplay}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      {timeFromNow(tx.timestamp)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!connectState && (
            <div className="py-12 text-center">
              <FiActivity
                className="mx-auto mb-4 h-12 w-12 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                Not connected to blockchain
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: colors.text.tertiary }}
              >
                Please connect to an RPC endpoint to view transactions
              </p>
            </div>
          )}

          {connectState && rows.length === 0 && (
            <div className="py-12 text-center">
              <FiActivity
                className="mx-auto mb-4 h-12 w-12 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No transactions yet
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: colors.text.tertiary }}
              >
                Transactions will appear here when they occur on the network
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transactions
