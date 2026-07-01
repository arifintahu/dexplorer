import React from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'

interface NativeBalanceTableProps {
  nativeTokens: readonly Coin[]
  nativeStakedToken: Coin | null
}

export default function NativeBalanceTable({
  nativeTokens,
  nativeStakedToken,
}: NativeBalanceTableProps) {
  const { colors } = useTheme()

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

  if (nativeTokens.length === 0 && !nativeStakedToken) return null

  const metricCard = (
    key: string,
    label: string,
    value: string,
    token: string,
    raw?: string
  ) => (
    <div
      key={key}
      className="panel-surface flex flex-col gap-[7px] px-[19px] py-[17px]"
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: colors.text.tertiary }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[20px] font-semibold"
        style={{ color: colors.text.primary }}
      >
        {value}
      </span>
      <span className="text-[11.5px]" style={{ color: colors.text.secondary }}>
        {token}
      </span>
      {raw && (
        <span
          className="font-mono text-[11px]"
          style={{ color: colors.text.tertiary }}
        >
          Raw: {raw}
        </span>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {nativeTokens.map((balance, index) => {
        const formatted = formatBalance(balance)
        const stakedForThisToken =
          nativeStakedToken && nativeStakedToken.denom === balance.denom
            ? nativeStakedToken
            : null
        const stakedFormatted = stakedForThisToken
          ? formatBalance(stakedForThisToken)
          : null

        return (
          <React.Fragment key={index}>
            {metricCard(
              `${index}-available`,
              'Available',
              formatted.formattedAmount,
              formatted.baseDenom.toUpperCase(),
              formatted.isConverted ? formatted.rawFormattedAmount : undefined
            )}
            {metricCard(
              `${index}-delegated`,
              'Delegated',
              stakedFormatted ? stakedFormatted.formattedAmount : '0',
              formatted.baseDenom.toUpperCase(),
              stakedFormatted?.isConverted
                ? stakedFormatted.rawFormattedAmount
                : undefined
            )}
          </React.Fragment>
        )
      })}

      {nativeTokens.length === 0 &&
        nativeStakedToken &&
        (() => {
          const stakedFormatted = formatBalance(nativeStakedToken)
          return (
            <React.Fragment>
              {metricCard(
                'staked-available',
                'Available',
                '0',
                stakedFormatted.baseDenom.toUpperCase()
              )}
              {metricCard(
                'staked-delegated',
                'Delegated',
                stakedFormatted.formattedAmount,
                stakedFormatted.baseDenom.toUpperCase(),
                stakedFormatted.isConverted
                  ? stakedFormatted.rawFormattedAmount
                  : undefined
              )}
            </React.Fragment>
          )
        })()}
    </div>
  )
}
