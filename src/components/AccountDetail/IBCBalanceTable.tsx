import React, { useState, useEffect } from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

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

  const pageButtonStyle = (active: boolean) => ({
    backgroundColor: active
      ? `${colors.primary}18`
      : colors.backgroundSecondary,
    borderColor: active ? `${colors.primary}66` : colors.border.primary,
    color: active ? colors.primary : colors.text.tertiary,
  })

  return (
    <div className="reference-table-shell">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-[15px]"
        style={{ borderColor: colors.border.primary }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            Other Available Tokens
          </span>
          <span
            className="reference-pill"
            style={{
              backgroundColor: `${colors.accent}20`,
              color: colors.accent,
            }}
          >
            {ibcTokens.length} tokens
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="ibc-items-per-page"
            className="text-xs"
            style={{ color: colors.text.tertiary }}
          >
            Show:
          </label>
          <select
            id="ibc-items-per-page"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="rounded-[8px] border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border.primary,
              color: colors.text.primary,
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div
        className="reference-table-header hidden gap-3 border-b px-5 py-3 md:grid md:grid-cols-[1fr_160px_200px]"
        style={{ borderColor: colors.border.primary }}
      >
        <span>Token</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Raw</span>
      </div>

      {paginatedIbcTokens.map((balance, index) => {
        const formatted = formatBalance(balance)
        return (
          <div
            key={index}
            className="reference-table-row grid gap-3 border-b px-5 py-4 md:grid-cols-[1fr_160px_200px] md:items-center"
            style={{ borderColor: colors.border.primary }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="inline-flex h-[22px] w-8 flex-shrink-0 items-center justify-center rounded-[6px] text-[9.5px] font-bold tracking-[0.03em]"
                style={{
                  backgroundColor: `${colors.accent}20`,
                  color: colors.accent,
                }}
              >
                IBC
              </span>
              <span
                className="truncate font-mono text-[12.5px]"
                style={{ color: colors.text.primary }}
                title={formatted.denom}
              >
                {formatted.formattedDenom}
              </span>
            </div>
            <span
              className="font-mono text-[12.5px] font-semibold md:text-right"
              style={{ color: colors.text.primary }}
            >
              {formatted.formattedAmount}
            </span>
            <span
              className="font-mono text-[12px] md:text-right"
              style={{ color: colors.text.tertiary }}
              title={formatted.amount}
            >
              {formatted.amount.length > 12
                ? formatted.amount.slice(0, 12) + '...'
                : formatted.amount}
            </span>
          </div>
        )
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-[14px]"
          style={{ borderColor: colors.border.primary }}
        >
          <span className="text-xs" style={{ color: colors.text.tertiary }}>
            Showing {showingStart}-{showingEnd} of {ibcTokens.length}
          </span>

          {/* Mobile: simplified Prev / Page X of Y / Next */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
            >
              Prev
            </button>
            <span
              className="text-xs font-medium"
              style={{ color: colors.text.tertiary }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
            >
              Next
            </button>
          </div>

          {/* Desktop: full First/Prev/page-numbers/Next/Last */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="rounded-[8px] border p-[7px] disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
              title="First page"
              aria-label="First page"
            >
              <FiChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
            >
              Prev
            </button>

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
                    type="button"
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="rounded-[8px] border px-[10px] py-[7px] text-[12.5px] font-medium"
                    style={pageButtonStyle(currentPage === pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-[8px] border px-[13px] py-[7px] text-[12.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded-[8px] border p-[7px] disabled:cursor-not-allowed disabled:opacity-50"
              style={pageButtonStyle(false)}
              title="Last page"
              aria-label="Last page"
            >
              <FiChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
