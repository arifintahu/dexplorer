import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiUser } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  timeFromNow,
  getTypeMsg,
  getActionFromAttributes,
  getModuleFromAttributes,
} from '@/utils/helper'
import { getSendersFromEvents } from '@/utils/cosmos'
import { selectTransactions } from '@/store/streamSlice'
import Avatar from '@/components/ui/Avatar'

interface Account {
  address: string
  module: string
  lastMessage: string
  lastActivity: string
}

const Accounts: React.FC = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()

  // Get recent transactions from Redux store
  const transactions = useSelector(selectTransactions)

  // Extract recent active accounts from transaction senders
  const recentAccounts: Account[] = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    const accountMap = new Map<
      string,
      { lastActivity: string; lastMessage: string; module: string }
    >()

    // Process recent transactions to extract senders and their last message
    transactions.slice(0, 20).forEach((tx) => {
      if (tx.result?.events) {
        const senders = getSendersFromEvents(tx.result.events)

        // Get the message type from events
        let messageType = 'Unknown'
        let moduleType = 'Unknown'
        const messageEvents = tx.result.events.filter(
          (e) => e.type === 'message'
        )
        const messageAction = messageEvents.find((e) =>
          e.attributes?.find((attr) => attr.key === 'action')
        )
        if (messageAction) {
          const action = getActionFromAttributes(messageAction.attributes)
          if (action) {
            messageType = getTypeMsg(action)
          }

          const module = getModuleFromAttributes(messageAction.attributes)
          if (module) {
            moduleType = module
          } else if (
            messageType === 'UpdateClient' ||
            messageType.includes('IBC')
          ) {
            moduleType = 'ibc.client'
          }
        }

        senders.forEach((sender) => {
          if (sender && sender.length > 0) {
            const existing = accountMap.get(sender)
            if (
              !existing ||
              new Date(tx.timestamp) > new Date(existing.lastActivity)
            ) {
              accountMap.set(sender, {
                lastActivity: tx.timestamp,
                lastMessage: messageType,
                module: moduleType,
              })
            }
          }
        })
      }
    })

    // Convert to Account array and limit to 10 most recent
    return Array.from(accountMap.entries())
      .map(([address, data]) => ({
        address,
        module: data.module,
        lastMessage: data.lastMessage,
        lastActivity: timeFromNow(data.lastActivity),
      }))
      .sort(
        (a, b) =>
          new Date(accountMap.get(b.address)!.lastActivity).getTime() -
          new Date(accountMap.get(a.address)!.lastActivity).getTime()
      )
      .slice(0, 10)
  }, [transactions])

  const accounts = recentAccounts

  return (
    <div className="reference-table-shell">
      <div
        className="flex items-center justify-between border-b px-5 py-[15px]"
        style={{ borderColor: colors.border.primary }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: colors.text.primary }}
        >
          Recent Account Activity
        </span>
        <span className="text-xs" style={{ color: colors.text.tertiary }}>
          Select an account for details
        </span>
      </div>

      {accounts.length > 0 && (
        <div
          className="reference-table-header hidden gap-3 border-b px-5 py-3 md:grid md:grid-cols-[2fr_130px_160px_110px]"
          style={{ borderColor: colors.border.primary }}
        >
          <span>Account</span>
          <span>Module</span>
          <span>Last Message</span>
          <span className="text-right">Last Active</span>
        </div>
      )}

      {accounts.map((account) => (
        <div
          key={account.address}
          role="button"
          tabIndex={0}
          className="reference-table-row grid cursor-pointer gap-3 border-b px-5 py-4 md:grid-cols-[2fr_130px_160px_110px] md:items-center"
          style={{ borderColor: colors.border.primary }}
          onClick={() => navigate(`/accounts/${account.address}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate(`/accounts/${account.address}`)
            }
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar address={account.address} size={32} />
            <Link
              to={`/accounts/${account.address}`}
              className="truncate font-mono text-[12.5px]"
              style={{ color: colors.text.primary }}
              title={account.address}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              {account.address}
            </Link>
          </div>
          <span
            className="reference-pill w-fit"
            style={{
              backgroundColor: `${colors.primary}20`,
              color: colors.primary,
            }}
          >
            {account.module}
          </span>
          <span
            className="truncate text-[13px]"
            style={{ color: colors.text.secondary }}
          >
            {account.lastMessage}
          </span>
          <span
            className="text-right text-xs"
            style={{ color: colors.text.tertiary }}
          >
            {account.lastActivity}
          </span>
        </div>
      ))}

      {accounts.length === 0 && (
        <div className="px-5 py-12 text-center">
          <FiUser
            className="mx-auto mb-4 h-12 w-12 opacity-50"
            style={{ color: colors.text.tertiary }}
          />
          <p style={{ color: colors.text.secondary }}>No accounts available</p>
          <p className="mt-1 text-sm" style={{ color: colors.text.tertiary }}>
            Account information will appear here
          </p>
        </div>
      )}
    </div>
  )
}

export default Accounts
