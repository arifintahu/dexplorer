import React, { useState } from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import {
  setNewBlock,
  setTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
  selectSubsNewBlock,
  selectSubsTxEvent,
} from '@/store/streamSlice'
import {
  FiSearch,
  FiMenu,
  FiSun,
  FiMoon,
  FiWifi,
  FiWifiOff,
  FiLogOut,
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'

interface TopNavigationProps {
  onMenuClick?: () => void
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuClick }) => {
  const { colors, colorScheme, toggleColorScheme } = useTheme()
  const dispatch = useDispatch()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const subsNewBlock = useSelector(selectSubsNewBlock)
  const subsTxEvent = useSelector(selectSubsTxEvent)
  const isConnected = connectState
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log('Searching for:', searchQuery)
    }
  }

  const handleDisconnect = () => {
    // Clean up subscriptions
    if (subsNewBlock) {
      subsNewBlock.unsubscribe()
      dispatch(setSubsNewBlock(null))
    }
    if (subsTxEvent) {
      subsTxEvent.unsubscribe()
      dispatch(setSubsTxEvent(null))
    }

    // Clear stream data
    dispatch(setNewBlock(null))
    dispatch(setTxEvent(null))

    // Clear connection
    dispatch(setConnectState(false))
    dispatch(setTmClient(null))
    dispatch(setRPCAddress(''))
    localStorage.removeItem('rpc_address')
    localStorage.removeItem('rpc_address_list')
  }

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-sm bg-opacity-80"
      style={{
        backgroundColor: `${colors.surface}cc`,
        borderColor: colors.border.primary,
      }}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left Section - Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: colors.text.tertiary }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, blocks, addresses..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-sm"
                style={
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border.secondary,
                    color: colors.text.primary,
                    '--tw-ring-color': `${colors.primary}40`,
                  } as React.CSSProperties
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.secondary
                }}
              />
            </div>
          </form>
        </div>

        {/* Right Section - Connection Status & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isConnected
                  ? `${colors.status.success}15`
                  : `${colors.status.error}15`,
                color: isConnected
                  ? colors.status.success
                  : colors.status.error,
                border: `1px solid ${
                  isConnected
                    ? `${colors.status.success}30`
                    : `${colors.status.error}30`
                }`,
              }}
            >
              {isConnected ? (
                <>
                  <div className="relative">
                    <FiWifi className="h-4 w-4" />
                    <div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: colors.status.success }}
                    ></div>
                  </div>
                  <span className="hidden sm:inline">Connected</span>
                </>
              ) : (
                <>
                  <FiWifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnected</span>
                </>
              )}
            </div>

            {/* Disconnect Button */}
            {isConnected && (
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                size="sm"
                title="Disconnect from RPC"
                style={{ color: colors.status.error }}
              >
                <FiLogOut className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            onClick={toggleColorScheme}
            variant="ghost"
            size="sm"
            title={`Switch to ${
              colorScheme === 'dark' ? 'light' : 'dark'
            } mode`}
          >
            {colorScheme === 'dark' ? (
              <FiSun className="h-4 w-4" />
            ) : (
              <FiMoon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation
