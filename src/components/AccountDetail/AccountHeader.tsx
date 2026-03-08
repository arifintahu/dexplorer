import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiChevronRight } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { Account } from '@cosmjs/stargate'

interface AccountHeaderProps {
  address: string
  account: Account | null
}

export default function AccountHeader({ address, account }: AccountHeaderProps) {
  const { colors } = useTheme()

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
    </div>
  )
}
