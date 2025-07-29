import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiChevronRight,
  FiHome,
  FiSearch,
  FiUser,
  FiDollarSign,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi'
import { useTheme } from '@/hooks/useTheme'
import { trimHash } from '@/utils/helper'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

interface Account {
  address: string
  balance: string
  type: 'user' | 'validator' | 'contract'
  transactions: number
  lastActivity: string
}

const Accounts: React.FC = () => {
  const { colors } = useTheme()
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Mock data - replace with real data from your store
  const accounts: Account[] = [
    {
      address: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu',
      balance: '1,234.56 ATOM',
      type: 'validator',
      transactions: 1250,
      lastActivity: '2 mins ago',
    },
    {
      address: 'cosmos1def456ghi789jkl012mno345pqr678stu901vwx',
      balance: '567.89 ATOM',
      type: 'user',
      transactions: 45,
      lastActivity: '15 mins ago',
    },
    {
      address: 'cosmos1ghi789jkl012mno345pqr678stu901vwx234yzab',
      balance: '89.12 ATOM',
      type: 'contract',
      transactions: 892,
      lastActivity: '1 hour ago',
    },
  ]

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

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'validator':
        return colors.status.success
      case 'contract':
        return colors.status.info
      case 'user':
      default:
        return colors.primary
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'validator':
        return '🛡️'
      case 'contract':
        return '📄'
      case 'user':
      default:
        return '👤'
    }
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

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <FiUser className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {accounts.filter((a) => a.type === 'user').length}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                User Accounts
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.status.success + '20' }}
            >
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {accounts.filter((a) => a.type === 'validator').length}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Validators
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.status.info + '20' }}
            >
              <span className="text-xl">📄</span>
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {accounts.filter((a) => a.type === 'contract').length}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Smart Contracts
              </p>
            </div>
          </div>
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
            Recent Accounts
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Recently active accounts on the network
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
                    className="p-3 rounded-lg text-xl"
                    style={{
                      backgroundColor: getAccountTypeColor(account.type) + '20',
                    }}
                  >
                    {getAccountTypeIcon(account.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        to={`/accounts/${account.address}`}
                        className="font-mono text-sm hover:opacity-70 transition-opacity"
                        style={{ color: colors.primary }}
                      >
                        {trimHash(account.address, 16)}
                      </Link>
                      <button
                        onClick={() => copyToClipboard(account.address)}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ color: colors.text.tertiary }}
                        title="Copy address"
                      >
                        <FiCopy className="w-3 h-3" />
                      </button>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium capitalize"
                        style={{
                          backgroundColor:
                            getAccountTypeColor(account.type) + '20',
                          color: getAccountTypeColor(account.type),
                        }}
                      >
                        {account.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FiDollarSign
                          className="w-3 h-3"
                          style={{ color: colors.text.tertiary }}
                        />
                        <span style={{ color: colors.text.secondary }}>
                          Balance: {account.balance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiExternalLink
                          className="w-3 h-3"
                          style={{ color: colors.text.tertiary }}
                        />
                        <span style={{ color: colors.text.secondary }}>
                          {account.transactions} txs
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
