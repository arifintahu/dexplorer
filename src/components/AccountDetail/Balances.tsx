import React from 'react'
import { Coin } from '@cosmjs/stargate'
import { useTheme } from '@/theme/ThemeProvider'
import { FiDollarSign } from 'react-icons/fi'
import NativeBalanceTable from './NativeBalanceTable'
import IBCBalanceTable from './IBCBalanceTable'

interface BalancesProps {
  balances: Coin[]
  stakedBalance: Coin | null
}

export default function Balances({ balances, stakedBalance }: BalancesProps) {
  const { colors } = useTheme()

  // Separate native and IBC tokens
  const nativeTokens = balances.filter(balance => !balance.denom.includes('/'))
  const ibcTokens = balances.filter(balance => balance.denom.includes('/'))
  
  // Find native token in staked balance
  const nativeStakedToken = stakedBalance && !stakedBalance.denom.includes('/') ? stakedBalance : null

  if (nativeTokens.length === 0 && !nativeStakedToken && ibcTokens.length === 0) {
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
          Balances
        </h2>
        <div
          className="border-b mb-4"
          style={{ borderColor: colors.border.secondary }}
        ></div>
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
      </div>
    )
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
        Balances
      </h2>
      <div
        className="border-b mb-4"
        style={{ borderColor: colors.border.secondary }}
      ></div>

      <div className="space-y-6">
        <NativeBalanceTable nativeTokens={nativeTokens} nativeStakedToken={nativeStakedToken} />
        <IBCBalanceTable ibcTokens={ibcTokens} />
      </div>
    </div>
  )
}
