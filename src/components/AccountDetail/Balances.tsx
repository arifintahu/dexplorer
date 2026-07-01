import React from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { FiDollarSign } from 'react-icons/fi'
import NativeBalanceTable from './NativeBalanceTable'
import IBCBalanceTable from './IBCBalanceTable'

interface BalancesProps {
  balances: readonly Coin[]
  stakedBalance: Coin | null
}

export default function Balances({ balances, stakedBalance }: BalancesProps) {
  const { colors } = useTheme()

  // Separate native and IBC tokens
  const nativeTokens = balances.filter(
    (balance) => !balance.denom.includes('/')
  )
  const ibcTokens = balances.filter((balance) => balance.denom.includes('/'))

  // Find native token in staked balance
  const nativeStakedToken =
    stakedBalance && !stakedBalance.denom.includes('/') ? stakedBalance : null

  if (
    nativeTokens.length === 0 &&
    !nativeStakedToken &&
    ibcTokens.length === 0
  ) {
    return (
      <div className="panel-surface px-6 py-5">
        <h2
          className="mb-4 text-[14px] font-semibold"
          style={{ color: colors.text.primary }}
        >
          Balances
        </h2>
        <div
          className="rounded-[11px] py-12 text-center"
          style={{
            backgroundColor: colors.backgroundSecondary,
            border: `1px solid ${colors.border.secondary}`,
          }}
        >
          <FiDollarSign
            className="mx-auto mb-4 h-12 w-12"
            style={{ color: colors.text.tertiary }}
          />
          <h3
            className="mb-2 text-[15px] font-medium"
            style={{ color: colors.text.secondary }}
          >
            No Balances Found
          </h3>
          <p className="text-sm" style={{ color: colors.text.tertiary }}>
            This account has no available or staked tokens
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-surface px-6 py-5">
      <h2
        className="mb-4 text-[14px] font-semibold"
        style={{ color: colors.text.primary }}
      >
        Balances
      </h2>

      <div className="flex flex-col gap-5">
        <NativeBalanceTable
          nativeTokens={nativeTokens}
          nativeStakedToken={nativeStakedToken}
        />
        <IBCBalanceTable ibcTokens={ibcTokens} />
      </div>
    </div>
  )
}
