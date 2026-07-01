import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { Account } from '@cosmjs/stargate'
import Avatar from '@/components/ui/Avatar'
import CopyText from '@/components/ui/CopyText'

interface AccountHeaderProps {
  address: string
  account: Account | null
}

export default function AccountHeader({
  address,
  account,
}: AccountHeaderProps) {
  const { colors } = useTheme()

  return (
    <div className="panel-surface flex flex-wrap items-center gap-[15px] px-6 py-5">
      <Avatar address={address} size={52} className="flex-shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="text-[17px] font-semibold"
          style={{ color: colors.text.primary }}
        >
          Account
        </span>
        <CopyText
          text={address}
          className="flex-wrap text-[13px] [&_span]:break-all"
          style={{ color: colors.text.secondary }}
        />
        <span className="text-[11.5px]" style={{ color: colors.text.tertiary }}>
          Account #{account?.accountNumber?.toString() ?? '—'} · Sequence{' '}
          {account?.sequence?.toString() ?? '—'}
        </span>
      </div>
    </div>
  )
}
