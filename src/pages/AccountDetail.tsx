import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiUser,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  getAccount,
  getAllBalances,
  getBalanceStaked,
  getTxsBySender,
} from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Account, Coin, IndexedTx } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { timeFromNow, displayDate, getTypeMsg } from '@/utils/helper'
import { decodeMsg, DecodeMsg } from '@/encoding'
import { toast } from 'sonner'

export default function AccountDetail() {
  const { address } = useParams<{ address: string }>()
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [account, setAccount] = useState<Account | null>(null)
  const [balances, setBalances] = useState<Coin[]>([])
  const [stakedBalance, setStakedBalance] = useState<Coin | null>(null)
  const [transactions, setTransactions] = useState<IndexedTx[]>([])
  const [decodedTxs, setDecodedTxs] = useState<
    { tx: IndexedTx; msgs: DecodeMsg[] }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tmClient && address) {
      setLoading(true)
      Promise.all([
        getAccount(tmClient, address).catch(() => null),
        getAllBalances(tmClient, address).catch(() => []),
        getBalanceStaked(tmClient, address).catch(() => null),
        getTxsBySender(tmClient, address, 1, 10).catch(() => ({
          txs: [],
          totalCount: 0,
        })),
      ])
        .then(([accountData, balanceData, stakedData, txData]) => {
          setAccount(accountData)
          setBalances([...balanceData])
          setStakedBalance(stakedData)
          setTransactions(
            Array.isArray(txData) ? [...txData] : [...(txData.txs || [])]
          )
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching account data:', error)
          toast.error('Failed to fetch account data')
          setLoading(false)
        })
    }
  }, [tmClient, address])

  useEffect(() => {
    if (transactions.length > 0) {
      const decoded: { tx: IndexedTx; msgs: DecodeMsg[] }[] = []

      for (const tx of transactions) {
        try {
          const txData = Tx.decode(tx.tx)
          const msgs: DecodeMsg[] = []

          for (const message of txData.body?.messages || []) {
            try {
              const msg = decodeMsg(message.typeUrl, message.value)
              msgs.push(msg)
            } catch (error) {
              console.error('Error decoding message:', error)
            }
          }

          decoded.push({ tx, msgs })
        } catch (error) {
          console.error('Error decoding transaction:', error)
        }
      }

      setDecodedTxs(decoded)
    }
  }, [transactions])

  const formatBalance = (balance: Coin) => {
    return (
      <div className="flex items-center gap-2">
        <span style={{ color: colors.text.primary }}>{balance.amount}</span>
        <span style={{ color: colors.text.secondary }}>{balance.denom}</span>
      </div>
    )
  }

  const renderTransactionMessages = (msgs: DecodeMsg[]) => {
    if (msgs.length === 0) return 'No messages'

    return (
      <div className="space-y-1">
        {msgs.map((msg, index) => (
          <span
            key={index}
            className="inline-block px-2 py-1 rounded text-xs font-medium mr-1 mb-1"
            style={{
              backgroundColor: colors.status.info + '20',
              color: colors.status.info,
            }}
          >
            {getTypeMsg(msg.typeUrl)}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Account
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: colors.primary }}
            ></div>
            <p style={{ color: colors.text.secondary }}>
              Loading account data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Account
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
        <Link
          to="/accounts"
          className="hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          Accounts
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.secondary }}>Account</span>
      </div>

      {/* Account Information */}
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
          Account Information
        </h2>
        <div
          className="border-b mb-4"
          style={{ borderColor: colors.border.secondary }}
        ></div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary, width: '150px' }}
                >
                  Address
                </td>
                <td
                  className="py-3 font-mono text-sm break-all"
                  style={{ color: colors.text.primary }}
                >
                  {address}
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Account Number
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {account?.accountNumber?.toString() || 'N/A'}
                </td>
              </tr>
              <tr>
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Sequence
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {account?.sequence?.toString() || 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balances */}
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
          Balances
        </h2>
        <div
          className="border-b mb-4"
          style={{ borderColor: colors.border.secondary }}
        ></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available Balances */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border.secondary}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign
                className="w-5 h-5"
                style={{ color: colors.status.success }}
              />
              <h3
                className="font-medium"
                style={{ color: colors.text.primary }}
              >
                Available
              </h3>
            </div>
            {balances.length > 0 ? (
              <div className="space-y-2">
                {balances.map((balance, index) => (
                  <div key={index}>{formatBalance(balance)}</div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.text.secondary }}>
                No available balances
              </p>
            )}
          </div>

          {/* Staked Balance */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border.secondary}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiActivity
                className="w-5 h-5"
                style={{ color: colors.status.warning }}
              />
              <h3
                className="font-medium"
                style={{ color: colors.text.primary }}
              >
                Staked
              </h3>
            </div>
            {stakedBalance ? (
              formatBalance(stakedBalance)
            ) : (
              <p style={{ color: colors.text.secondary }}>No staked balance</p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
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
          Recent Transactions ({transactions.length})
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
                        to={`/txs/${tx.hash}`}
                        className="font-mono text-sm hover:opacity-70 transition-opacity"
                        style={{ color: colors.primary }}
                      >
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
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
                            tx.code === 0
                              ? colors.status.success + '20'
                              : colors.status.error + '20',
                          color:
                            tx.code === 0
                              ? colors.status.success
                              : colors.status.error,
                        }}
                      >
                        {tx.code === 0 ? 'Success' : 'Failed'}
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
    </div>
  )
}
