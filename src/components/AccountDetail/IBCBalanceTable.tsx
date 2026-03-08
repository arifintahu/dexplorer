import React, { useState, useEffect } from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'
import {
  FiDollarSign,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
} from 'react-icons/fi'

interface IBCBalanceTableProps {
  ibcTokens: readonly Coin[]
}

export default function IBCBalanceTable({ ibcTokens }: IBCBalanceTableProps) {
  const { colors } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  const formatBalance = (balance: Coin) => {
    const { converted, base } = getConvertedAmount(
      balance.amount,
      balance.denom
    )

    return {
      amount: balance.amount,
      convertedAmount: converted,
      formattedAmount: formatAmount(converted),
      rawFormattedAmount: formatAmount(balance.amount),
      denom: balance.denom,
      baseDenom: base,
      formattedDenom: formatDenom(balance.denom),
      isIBC: balance.denom.startsWith('ibc/'),
      isConverted:
        balance.denom.startsWith('u') || balance.denom.startsWith('a'),
    }
  }

  if (ibcTokens.length === 0) return null

  return (
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
            <span className="text-sm" style={{ color: colors.text.secondary }}>
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
          <span className="text-sm" style={{ color: colors.text.secondary }}>
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
                      e.currentTarget.style.backgroundColor =
                        colors.surface + '50'
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
          <div
            className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: `1px solid ${colors.border.secondary}` }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
                style={{
                  backgroundColor:
                    currentPage === 1 ? colors.surface : colors.background,
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
                  backgroundColor:
                    currentPage === 1 ? colors.surface : colors.background,
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
                      backgroundColor:
                        currentPage === pageNum
                          ? colors.primary
                          : colors.background,
                      borderColor:
                        currentPage === pageNum
                          ? colors.primary
                          : colors.border.secondary,
                      color:
                        currentPage === pageNum
                          ? colors.background
                          : colors.text.primary,
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
                  backgroundColor:
                    currentPage === totalPages
                      ? colors.surface
                      : colors.background,
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
                  backgroundColor:
                    currentPage === totalPages
                      ? colors.surface
                      : colors.background,
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
  )
}
