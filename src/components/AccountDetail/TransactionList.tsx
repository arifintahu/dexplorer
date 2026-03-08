import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { toHex } from '@cosmjs/encoding'
import { trimHash, getTypeMsg } from '@/utils/helper'
import { FiUser } from 'react-icons/fi'
import { DecodedTx } from '@/hooks/useAccountData'
import { DecodeMsg } from '@/encoding'

interface TransactionListProps {
  decodedTxs: DecodedTx[]
  totalCount: number
}

export default function TransactionList({ decodedTxs, totalCount }: TransactionListProps) {
  const { colors } = useTheme()

  const renderTransactionMessages = (msgs: DecodeMsg[]) => {
    if (msgs.length === 0) return 'No messages'

    if (msgs.length === 1) {
      return (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: colors.primary + '20',
            color: colors.primary,
          }}
        >
          {getTypeMsg(msgs[0].typeUrl)}
        </span>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.primary + '20',
              color: colors.primary,
            }}
          >
            {getTypeMsg(msgs[0].typeUrl)}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: colors.primary }}
          >
            +{msgs.length - 1}
          </span>
        </div>
      )
    }
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Recent Transactions ({totalCount})
      </h2>
      <div
        className="border-b mb-4"
        style={{ borderColor: colors.border.secondary }}
      ></div>

      {decodedTxs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <th
                  className="text-left py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Hash
                </th>
                <th
                  className="text-left py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Height
                </th>
                <th
                  className="text-left py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Messages
                </th>
                <th
                  className="text-left py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {decodedTxs.slice(0, 10).map(({ tx, msgs }, index) => (
                <tr
                  key={index}
                  className="border-b"
                  style={{ borderColor: colors.border.secondary }}
                >
                  <td className="py-3 px-0">
                    <Link
                      to={`/txs/${toHex(tx.hash)}`}
                      className="font-mono text-sm hover:opacity-70 transition-opacity"
                      style={{ color: colors.primary }}
                    >
                      {trimHash(tx.hash)}
                    </Link>
                  </td>
                  <td className="py-3 px-0">
                    <Link
                      to={`/blocks/${tx.height}`}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: colors.primary }}
                    >
                      {tx.height}
                    </Link>
                  </td>
                  <td className="py-3 px-0">
                    {renderTransactionMessages(msgs)}
                  </td>
                  <td className="py-3 px-0">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          tx.result.code === 0
                            ? colors.status.success + '20'
                            : colors.status.error + '20',
                        color:
                          tx.result.code === 0
                            ? colors.status.success
                            : colors.status.error,
                      }}
                    >
                      {tx.result.code === 0 ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <FiUser
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: colors.text.tertiary }}
          />
          <p style={{ color: colors.text.secondary }}>
            No transactions found
          </p>
        </div>
      )}
    </div>
  )
}
