import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiSearch,
  FiActivity,
  FiHash,
  FiClock,
  FiUser,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  trimHash,
  timeFromNow,
  getTypeMsg,
  getActionFromAttributes,
} from '@/utils/helper'
import { Button } from '@/components/ui/Button'
import { RootState } from '@/store'
import { selectTransactions } from '@/store/streamSlice'

const Transactions: React.FC = () => {
  const { colors } = useTheme()
  const [searchHash, setSearchHash] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  // Get persistent transaction data from Redux store
  const transactions = useSelector(selectTransactions)
  const { connectState } = useSelector((state: RootState) => state.connect)

  const navigate = useNavigate()

  // Helper function to get transaction status
  const getTransactionStatus = (result: any): 'success' | 'failed' => {
    if (!result) return 'failed'
    return result.code === 0 ? 'success' : 'failed'
  }

  const renderEventMessages = (
    events: [{ type: string; attributes: [{ key: string; value: string }] }]
  ) => {
    try {
      if (!events || !events.length)
        return <span className="text-xs opacity-60">No data</span>

      const messages = events.filter((e) => {
        if (e.type == 'message') {
          const hasAction = e.attributes.some((a) => {
            if (a.key == 'action') {
              return a.value
            }
          })

          if (hasAction) {
            return e.attributes
          }
        }
      })

      if (messages.length === 1) {
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: colors.primary + '20',
              color: colors.primary,
            }}
          >
            {getTypeMsg(getActionFromAttributes(messages[0].attributes))}
          </span>
        )
      } else if (messages.length > 1) {
        return (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors.primary + '20',
                color: colors.primary,
              }}
            >
              {getTypeMsg(getActionFromAttributes(messages[0].attributes))}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: colors.primary }}
            >
              +{messages.length - 1}
            </span>
          </div>
        )
      }
    } catch (error) {
      console.error('Error decoding events:', error)
      return <span className="text-xs opacity-60">Invalid data</span>
    }

    return <span className="text-xs opacity-60">No messages</span>
  }

  const handleSearch = () => {
    if (!searchHash.trim()) return
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
      // Navigate to transaction detail page
      navigate(`/txs/${searchHash}`)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return colors.status.success
      case 'failed':
        return colors.status.error
      case 'pending':
        return colors.status.warning
      default:
        return colors.text.secondary
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
          Transactions
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
        <span style={{ color: colors.text.secondary }}>Transactions</span>
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
          Search Transaction
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiHash
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.text.tertiary }}
            />
            <input
              type="text"
              placeholder="Enter transaction hash..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
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
            disabled={!searchHash.trim() || isSearching}
            variant="primary"
            size="md"
            loading={isSearching}
          >
            <FiSearch className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
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
            Recent Transactions
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Latest transactions on the network
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiHash className="w-4 h-4" />
                    Hash
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Height
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Messages
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiActivity className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Time
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map((tx, index) => {
                const status = getTransactionStatus(tx.result)
                return (
                  <tr
                    key={`${tx.hash}-${index}`}
                    className="border-b hover:bg-opacity-50 transition-colors duration-200"
                    style={{
                      borderColor: colors.border.secondary,
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.background + '50'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/txs/${tx.hash}`}
                        className="hover:opacity-70 transition-opacity font-mono text-sm"
                        style={{ color: colors.primary }}
                      >
                        {tx.hash ? trimHash(tx.hash) : 'Unknown'}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/blocks/${tx.height}`}
                        className="hover:opacity-70 transition-opacity font-mono"
                        style={{ color: colors.primary }}
                      >
                        {tx.height}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {renderEventMessages(tx.result?.events)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: getStatusColor(status) + '20',
                          color: getStatusColor(status),
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {timeFromNow(tx.timestamp)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!connectState && (
            <div className="text-center py-12">
              <FiActivity
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                Not connected to blockchain
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Please connect to an RPC endpoint to view transactions
              </p>
            </div>
          )}

          {connectState && transactions.length === 0 && (
            <div className="text-center py-12">
              <FiActivity
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No transactions yet
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Transactions will appear here when they occur on the network
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transactions
