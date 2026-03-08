import React from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'
import { FiUser } from 'react-icons/fi'

interface NativeBalanceTableProps {
  nativeTokens: Coin[]
  nativeStakedToken: Coin | null
}

export default function NativeBalanceTable({ nativeTokens, nativeStakedToken }: NativeBalanceTableProps) {
  const { colors } = useTheme()

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

  if (nativeTokens.length === 0 && !nativeStakedToken) return null

  return (
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
  )
}
