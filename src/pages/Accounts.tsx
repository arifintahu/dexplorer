import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiSearch,
  FiUser,
  FiCopy,
  FiMail,
  FiFolder,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { timeFromNow, getTypeMsg, getActionFromAttributes, getModuleFromAttributes } from '@/utils/helper'
import { getSendersFromEvents } from '@/utils/cosmos'
import { selectTransactions } from '@/store/streamSlice'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

interface Account {
  address: string
  module: string
  lastMessage: string
  lastActivity: string
}

const Accounts: React.FC = () => {
  const { colors } = useTheme()
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Get recent transactions from Redux store
  const transactions = useSelector(selectTransactions)
  
  // Extract recent active accounts from transaction senders
  const recentAccounts: Account[] = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }
    
    const accountMap = new Map<string, { lastActivity: string; lastMessage: string, module: string }>()
    
    // Process recent transactions to extract senders and their last message
    transactions.slice(0, 20).forEach((tx) => {
      if (tx.result?.events) {
        const senders = getSendersFromEvents(tx.result.events)
        
        // Get the message type from events
        let messageType = 'Unknown'
        let moduleType = 'Unknown'
        const messageEvents = tx.result.events.filter((e: any) => e.type === 'message')
        const messageAction = messageEvents.find((e: any) => e.attributes?.find((attr: any) => attr.key === 'action'))
        if (messageAction) {
          const action = getActionFromAttributes(messageAction.attributes)
          if (action) {
            messageType = getTypeMsg(action)
          }

          const module = getModuleFromAttributes(messageAction.attributes)
          if (module) {
            moduleType = module
          }
        }
        
        senders.forEach((sender) => {
          if (sender && sender.length > 0) {
            const existing = accountMap.get(sender)
            if (!existing || new Date(tx.timestamp) > new Date(existing.lastActivity)) {
              accountMap.set(sender, {
                lastActivity: tx.timestamp,
                lastMessage: messageType,
                module: moduleType
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
        lastActivity: timeFromNow(data.lastActivity)
      }))
      .sort((a, b) => new Date(accountMap.get(b.address)!.lastActivity).getTime() - new Date(accountMap.get(a.address)!.lastActivity).getTime())
      .slice(0, 10)
  }, [transactions])
  
  // Use recentAccounts for display, but keep mock data for stats
  const accounts = recentAccounts

  const handleSearch = () => {
    if (!searchAddress.trim()) return
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
      // Navigate to account detail page
      window.location.href = `/accounts/${searchAddress}`
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Address copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Accounts
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
        <span style={{ color: colors.text.secondary }}>Accounts</span>
      </div>

      {/* Search Section */}
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
          Search Account
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiUser
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.text.tertiary }}
            />
            <input
              type="text"
              placeholder="Enter account address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border.secondary,
                color: colors.text.primary,
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchAddress.trim() || isSearching}
            variant="primary"
            size="md"
            loading={isSearching}
          >
            <FiSearch className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Recent Accounts */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Recent Active Accounts
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Message senders from recent transactions on the network
          </p>
        </div>

        <div className="space-y-3">
          {accounts.map((account, index) => (
            <div
              key={account.address}
              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border.secondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.secondary
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: colors.primary + '20',
                    }}
                  >
                    <FiUser className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        to={`/accounts/${account.address}`}
                        className="font-mono text-sm hover:opacity-70 transition-opacity"
                        style={{ color: colors.primary }}
                      >
                        {account.address}
                      </Link>
                      <button
                        onClick={() => copyToClipboard(account.address)}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ color: colors.text.tertiary }}
                        title="Copy address"
                      >
                        <FiCopy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FiFolder
                          className="w-3 h-3"
                          style={{ color: colors.text.tertiary }}
                        />
                        <span style={{ color: colors.text.secondary }}>
                          Module: {account.module}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMail
                          className="w-3 h-3"
                          style={{ color: colors.text.tertiary }}
                        />
                        <span style={{ color: colors.text.secondary }}>
                          Message: {account.lastMessage}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Last Activity
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.text.tertiary }}
                  >
                    {account.lastActivity}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="text-center py-12">
              <FiUser
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No accounts available
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Account information will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Accounts
