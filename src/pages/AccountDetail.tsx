import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiUser,
  FiDollarSign,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  getAccount,
  getAllBalances,
  getBalanceStaked,
  getTxsBySender,
} from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Account, Coin } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getTypeMsg, trimHash } from '@/utils/helper'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'
import { decodeMsg, DecodeMsg } from '@/encoding'
import { toast } from 'sonner'
import { TxResponse } from '@cosmjs/tendermint-rpc'
import { toHex } from '@cosmjs/encoding'

export default function AccountDetail() {
  const { address } = useParams<{ address: string }>()
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [account, setAccount] = useState<Account | null>(null)
  const [balances, setBalances] = useState<Coin[]>([])
  const [stakedBalance, setStakedBalance] = useState<Coin | null>(null)
  const [transactions, setTransactions] = useState<TxResponse[]>([])
  const [decodedTxs, setDecodedTxs] = useState<
    { tx: TxResponse; msgs: DecodeMsg[] }[]
  >([])
  const [loading, setLoading] = useState(true)
  
  // Pagination state for IBC tokens
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
      const decoded: { tx: TxResponse; msgs: DecodeMsg[] }[] = []

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
    const { converted, base } = getConvertedAmount(balance.amount, balance.denom)

    return {
      amount: balance.amount,
      convertedAmount: converted,
      formattedAmount: formatAmount(converted),
      rawFormattedAmount: formatAmount(balance.amount),
      denom: balance.denom,
      baseDenom: base,
      formattedDenom: formatDenom(balance.denom),
      isIBC: balance.denom.startsWith('ibc/'),
      isConverted: balance.denom.startsWith('u') || balance.denom.startsWith('a')
    }
  }

  // Separate native and IBC tokens
  const nativeTokens = balances.filter(balance => !balance.denom.includes('/'))
  const ibcTokens = balances.filter(balance => balance.denom.includes('/'))
  
  // Find native token in staked balance
  const nativeStakedToken = stakedBalance && !stakedBalance.denom.includes('/') ? stakedBalance : null

  // Pagination calculations for IBC tokens
  const totalPages = Math.ceil(ibcTokens.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIbcTokens = ibcTokens.slice(startIndex, endIndex)
  const showingStart = ibcTokens.length > 0 ? startIndex + 1 : 0
  const showingEnd = Math.min(endIndex, ibcTokens.length)

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Reset to first page when IBC tokens change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [ibcTokens.length, totalPages, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }

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

        <div className="space-y-6">
          {/* Native Token Section */}
          {(nativeTokens.length > 0 || nativeStakedToken) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiUser
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
                <h3
                  className="text-lg font-medium"
                  style={{ color: colors.text.primary }}
                >
                  Native Token
                </h3>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      style={{
                        backgroundColor: colors.surface,
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <tr>
                        <th
                          className="text-left py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Token
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Available
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Delegated
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nativeTokens.length > 0 ? (
                        nativeTokens.map((balance, index) => {
                          const formatted = formatBalance(balance)
                          const stakedForThisToken = nativeStakedToken && nativeStakedToken.denom === balance.denom ? nativeStakedToken : null
                          const stakedFormatted = stakedForThisToken ? formatBalance(stakedForThisToken) : null
                          const totalAmount = stakedForThisToken 
                            ? (parseFloat(balance.amount) + parseFloat(stakedForThisToken.amount)).toString()
                            : balance.amount
                          const totalFormatted = formatBalance({ amount: totalAmount, denom: balance.denom })
                          
                          return (
                            <tr
                              key={index}
                              className="border-b hover:bg-opacity-50 transition-colors"
                              style={{
                                borderColor: colors.border.secondary,
                                backgroundColor: 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.surface + '50'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span
                                    className="font-mono text-sm font-semibold"
                                    style={{ color: colors.text.primary }}
                                  >
                                    {formatted.baseDenom.toUpperCase()}
                                  </span>
                                  {formatted.isConverted && (
                                    <span
                                      className="text-xs font-mono"
                                      style={{ color: colors.text.tertiary }}
                                      title={`Raw denomination: ${formatted.denom}`}
                                    >
                                      ({formatted.denom})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span
                                    className="font-semibold text-lg"
                                    style={{ color: colors.status.success }}
                                  >
                                    {formatted.formattedAmount}
                                  </span>
                                  {formatted.isConverted && (
                                    <span
                                      className="text-xs font-mono"
                                      style={{ color: colors.text.tertiary }}
                                      title={`Raw amount: ${formatted.amount}`}
                                    >
                                      Raw: {formatted.rawFormattedAmount}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span
                                    className="font-semibold text-lg"
                                    style={{ color: colors.status.warning }}
                                  >
                                    {stakedFormatted ? stakedFormatted.formattedAmount : '0'}
                                  </span>
                                  {stakedFormatted && stakedFormatted.isConverted && (
                                    <span
                                      className="text-xs font-mono"
                                      style={{ color: colors.text.tertiary }}
                                      title={`Raw amount: ${stakedFormatted.amount}`}
                                    >
                                      Raw: {stakedFormatted.rawFormattedAmount}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span
                                    className="font-bold text-lg"
                                    style={{ color: colors.text.primary }}
                                  >
                                    {totalFormatted.formattedAmount}
                                  </span>
                                  {totalFormatted.isConverted && (
                                    <span
                                      className="text-xs font-mono"
                                      style={{ color: colors.text.tertiary }}
                                      title={`Raw total: ${totalAmount}`}
                                    >
                                      Raw: {totalFormatted.rawFormattedAmount}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      ) : nativeStakedToken ? (
                        <tr
                          className="border-b hover:bg-opacity-50 transition-colors"
                          style={{
                            borderColor: colors.border.secondary,
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.surface + '50'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span
                                className="font-mono text-sm font-semibold"
                                style={{ color: colors.text.primary }}
                              >
                                {formatBalance(nativeStakedToken).baseDenom.toUpperCase()}
                              </span>
                              {formatBalance(nativeStakedToken).isConverted && (
                                <span
                                  className="text-xs font-mono"
                                  style={{ color: colors.text.tertiary }}
                                  title={`Raw denomination: ${nativeStakedToken.denom}`}
                                >
                                  ({nativeStakedToken.denom})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className="font-semibold text-lg"
                              style={{ color: colors.status.success }}
                            >
                              0
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span
                                className="font-semibold text-lg"
                                style={{ color: colors.status.warning }}
                              >
                                {formatBalance(nativeStakedToken).formattedAmount}
                              </span>
                              {formatBalance(nativeStakedToken).isConverted && (
                                <span
                                  className="text-xs font-mono"
                                  style={{ color: colors.text.tertiary }}
                                  title={`Raw amount: ${nativeStakedToken.amount}`}
                                >
                                  Raw: {formatBalance(nativeStakedToken).rawFormattedAmount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span
                                className="font-bold text-lg"
                                style={{ color: colors.text.primary }}
                              >
                                {formatBalance(nativeStakedToken).formattedAmount}
                              </span>
                              {formatBalance(nativeStakedToken).isConverted && (
                                <span
                                  className="text-xs font-mono"
                                  style={{ color: colors.text.tertiary }}
                                  title={`Raw amount: ${nativeStakedToken.amount}`}
                                >
                                  Raw: {formatBalance(nativeStakedToken).rawFormattedAmount}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other Available Tokens (IBC) */}
          {ibcTokens.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiDollarSign
                    className="w-5 h-5"
                    style={{ color: colors.status.info }}
                  />
                  <h3
                    className="text-lg font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Other Available Tokens ({ibcTokens.length})
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Show:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 rounded text-sm border"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border.secondary,
                        color: colors.text.primary,
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Showing {showingStart}-{showingEnd} of {ibcTokens.length}
                  </span>
                </div>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      style={{
                        backgroundColor: colors.surface,
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <tr>
                        <th
                          className="text-left py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Token
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Amount
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Raw Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                    {paginatedIbcTokens.map((balance, index) => {
                        const formatted = formatBalance(balance)
                        return (
                          <tr
                            key={index}
                            className="border-b hover:bg-opacity-50 transition-colors"
                            style={{
                              borderColor: colors.border.secondary,
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.surface + '50'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: colors.status.info + '20',
                                    color: colors.status.info,
                                  }}
                                >
                                  IBC
                                </span>
                                <span
                                  className="font-mono text-sm"
                                  style={{ color: colors.text.primary }}
                                  title={formatted.denom}
                                >
                                  {formatted.formattedDenom}
                                </span>
                              </div>
                            </td>
                            <td
                              className="py-3 px-4 text-right font-semibold"
                              style={{ color: colors.text.primary }}
                            >
                              {formatted.formattedAmount}
                            </td>
                            <td
                              className="py-3 px-4 text-right font-mono text-sm"
                              style={{ color: colors.text.secondary }}
                              title={formatted.amount}
                            >
                              {formatted.amount.length > 12
                                ? formatted.amount.slice(0, 12) + '...'
                                : formatted.amount}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border.secondary}` }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
                        style={{
                          backgroundColor: currentPage === 1 ? colors.surface : colors.background,
                          borderColor: colors.border.secondary,
                          color: colors.text.primary,
                        }}
                        title="First page"
                      >
                        <FiChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
                        style={{
                          backgroundColor: currentPage === 1 ? colors.surface : colors.background,
                          borderColor: colors.border.secondary,
                          color: colors.text.primary,
                        }}
                        title="Previous page"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className="px-3 py-1 rounded border text-sm hover:bg-opacity-80 transition-colors"
                            style={{
                              backgroundColor: currentPage === pageNum ? colors.primary : colors.background,
                              borderColor: currentPage === pageNum ? colors.primary : colors.border.secondary,
                              color: currentPage === pageNum ? colors.background : colors.text.primary,
                            }}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
                        style={{
                          backgroundColor: currentPage === totalPages ? colors.surface : colors.background,
                          borderColor: colors.border.secondary,
                          color: colors.text.primary,
                        }}
                        title="Next page"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
                        style={{
                          backgroundColor: currentPage === totalPages ? colors.surface : colors.background,
                          borderColor: colors.border.secondary,
                          color: colors.text.primary,
                        }}
                        title="Last page"
                      >
                        <FiChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {nativeTokens.length === 0 && !nativeStakedToken && ibcTokens.length === 0 && (
            <div
              className="text-center py-12 rounded-lg"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border.secondary}`,
              }}
            >
              <FiDollarSign
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: colors.text.tertiary }}
              />
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                No Balances Found
              </h3>
              <p style={{ color: colors.text.tertiary }}>
                This account has no available or staked tokens
              </p>
            </div>
          )}
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
    </div>
  )
}
