import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { useNavigate } from 'react-router-dom'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
  selectTmClient,
  selectRPCAddress,
} from '@/store/connectSlice'
import {
  setNewBlock,
  setTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
  selectSubsNewBlock,
  selectSubsTxEvent,
  addBlock,
  addTransaction,
  clearPersistentData,
} from '@/store/streamSlice'
import {
  setStakingParams,
  setMintParams,
  setDistributionParams,
  setSlashingParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} from '@/store/paramsSlice'
import {
  FiSearch,
  FiMenu,
  FiSun,
  FiMoon,
  FiWifi,
  FiWifiOff,
  FiLogOut,
  FiRefreshCcw,
  FiZap,
  FiTrash2,
  FiCheck,
  FiX,
  FiRadio,
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'
import { toast } from 'sonner'

interface TopNavigationProps {
  onMenuClick?: () => void
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuClick }) => {
  const { colors, colorScheme, toggleColorScheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const subsNewBlock = useSelector(selectSubsNewBlock)
  const subsTxEvent = useSelector(selectSubsTxEvent)
  const isConnected = connectState
  const [searchQuery, setSearchQuery] = useState('')

  // RPC Management State
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState(false)
  const [isRPCModalOpen, setIsRPCModalOpen] = useState(false)
  const [rpcList, setRPCList] = useState<string[]>([])

  // Search patterns
  const heightRegex = /^\d+$/
  const txhashRegex = /^[A-Za-z\d]{64}$/
  const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

  // Load RPC list from localStorage on component mount
  useEffect(() => {
    const savedRPCList = localStorage.getItem(LS_RPC_ADDRESS_LIST)
    if (savedRPCList) {
      try {
        setRPCList(JSON.parse(savedRPCList))
      } catch (error) {
        console.error('Error parsing RPC list from localStorage:', error)
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (heightRegex.test(searchQuery)) {
      navigate(`/blocks/${searchQuery}`)
    } else if (txhashRegex.test(searchQuery)) {
      navigate(`/txs/${searchQuery}`)
    } else if (addrRegex.test(searchQuery)) {
      navigate(`/account/${searchQuery}`)
    } else {
      toast.error('Invalid search query format')
    }
    setSearchQuery('')
  }

  const resetApplicationData = async () => {
    console.log('Resetting application data...')

    // Clean up subscriptions first
    if (subsNewBlock) {
      console.log('Unsubscribing from new block subscription')
      subsNewBlock.unsubscribe()
      dispatch(setSubsNewBlock(null))
    }
    if (subsTxEvent) {
      console.log('Unsubscribing from tx event subscription')
      subsTxEvent.unsubscribe()
      dispatch(setSubsTxEvent(null))
    }

    // Disconnect the old WebSocket client
    if (tmClient) {
      try {
        console.log('Disconnecting tmClient...')
        await tmClient.disconnect()
        console.log('tmClient disconnected successfully')
      } catch (error) {
        console.warn('Error disconnecting tmClient:', error)
      }
    }

    // Clear the tmClient from Redux state immediately
    dispatch(setTmClient(null))

    // Reset stream data
    dispatch(setNewBlock(null))
    dispatch(setTxEvent(null))

    // Clear persistent blocks and transactions
    dispatch(clearPersistentData())

    // Reset parameters data
    dispatch(setStakingParams(null))
    dispatch(setMintParams(null))
    dispatch(setDistributionParams(null))
    dispatch(setSlashingParams(null))
    dispatch(setGovVotingParams(null))
    dispatch(setGovDepositParams(null))
    dispatch(setGovTallyParams(null))

    console.log('Application data reset complete')
  }

  const connectClient = async (rpcAddress: string) => {
    setState('submitting')
    setError(false)

    try {
      const cleanAddress = removeTrailingSlash(rpcAddress)
      const isValid = await validateConnection(cleanAddress)

      if (!isValid) {
        setError(true)
        setState('initial')
        toast.error('Failed to connect to RPC endpoint')
        return
      }

      console.log('Starting connection to new RPC:', cleanAddress)

      // Reset all application data before connecting to new RPC
      await resetApplicationData()

      // Add a small delay to ensure cleanup is complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      console.log('Creating new tmClient...')
      const tmClient = await connectWebsocketClient(cleanAddress)

      if (tmClient) {
        dispatch(setTmClient(tmClient))
        dispatch(setRPCAddress(cleanAddress))
        dispatch(setConnectState(true))
        setState('success')

        console.log('Starting new subscriptions...')

        // Start blockchain data subscriptions
        const newBlockSub = subscribeNewBlock(tmClient, (event) => {
          dispatch(setNewBlock(event))
          dispatch(addBlock(event))
        })

        const txSub = subscribeTx(tmClient, (event) => {
          dispatch(setTxEvent(event))
          dispatch(addTransaction(event))
        })

        dispatch(setSubsNewBlock(newBlockSub))
        dispatch(setSubsTxEvent(txSub))

        console.log('New subscriptions started successfully')

        // Save current RPC address to localStorage
        localStorage.setItem(LS_RPC_ADDRESS, cleanAddress)

        // Always save all RPC endpoints to localStorage
        const currentList = JSON.parse(
          localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
        )

        let updatedList = [...currentList]

        // Add new address if it doesn't exist
        if (!currentList.includes(cleanAddress)) {
          updatedList = [cleanAddress, ...currentList]
        } else {
          // Move existing address to the front
          updatedList = [
            cleanAddress,
            ...currentList.filter((addr) => addr !== cleanAddress),
          ]
        }

        // Always update localStorage with the complete list
        localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(updatedList))
        setRPCList(updatedList)

        toast.success('Successfully connected to RPC endpoint')
        setIsRPCModalOpen(false)
        setNewAddress('')
      } else {
        setError(true)
        setState('initial')
        toast.error('Failed to establish connection')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError(true)
      setState('initial')
      toast.error('Connection failed')
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newAddress.trim()) {
      connectClient(newAddress.trim())
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewAddress(e.target.value)
    if (error) setError(false)
  }

  const selectChain = (rpcAddress: string) => {
    connectClient(rpcAddress)
  }

  const removeChain = (rpcAddress: string) => {
    const updatedList = rpcList.filter((addr) => addr !== rpcAddress)
    setRPCList(updatedList)
    localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(updatedList))
    toast.success('RPC address removed')
  }

  const handleDisconnect = async () => {
    console.log('Disconnecting from RPC...')

    // Reset all application data
    await resetApplicationData()

    // Clear connection
    dispatch(setConnectState(false))
    dispatch(setRPCAddress(''))
    localStorage.removeItem(LS_RPC_ADDRESS)
    // Note: We keep the RPC address list for future connections
    toast.success('Disconnected from RPC endpoint')

    console.log('Disconnection complete')
  }

  return (
    <>
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
              className="lg:hidden focus:outline-none focus:ring-0 active:outline-none border-0 focus:border-0 active:border-0"
              style={{
                color: colors.text.primary,
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
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
                    <div className="hidden sm:flex sm:flex-col sm:items-start">
                      <span className="text-xs font-medium">Connected to:</span>
                      <span
                        className="text-xs truncate max-w-32"
                        title={address}
                      >
                        {address ? new URL(address).hostname : 'Unknown'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <FiWifiOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </>
                )}
              </div>

              {/* Change Connection Button */}
              <Button
                onClick={() => setIsRPCModalOpen(true)}
                variant="ghost"
                size="sm"
                title="Change RPC Connection"
                className="text-sm focus:outline-none focus:ring-0 active:outline-none border-0 focus:border-0 active:border-0"
                style={{
                  color: colors.text.primary,
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <FiRefreshCcw className="h-4 w-4" />
                <span className="hidden md:inline ml-1">Change</span>
              </Button>

              {/* Disconnect Button */}
              {isConnected && (
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="sm"
                  title="Disconnect from RPC"
                  className="focus:outline-none focus:ring-0 active:outline-none border-0 focus:border-0 active:border-0"
                  style={{
                    color: colors.status.error,
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none',
                  }}
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
              className="focus:outline-none focus:ring-0 active:outline-none border-0 focus:border-0 active:border-0"
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
                color: colors.text.primary,
              }}
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

      {/* RPC Connection Modal */}
      {isRPCModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
            style={{
              backgroundColor: colors.background,
              color: colors.text.primary,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">RPC Connection</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRPCModalOpen(false)}
              >
                <FiX className="h-4 w-4" />
              </Button>
            </div>

            {/* Add New RPC Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  RPC Endpoint URL
                </label>
                <input
                  type="url"
                  value={newAddress}
                  onChange={handleInputChange}
                  placeholder="https://rpc.example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    error ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: colors.background,
                    borderColor: error ? '#ef4444' : colors.border.secondary,
                    color: colors.text.primary,
                  }}
                  required
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">
                    Failed to connect to this RPC endpoint
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full"
              >
                {state === 'submitting' ? (
                  <>
                    <FiRefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiZap className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </form>

            {/* Saved RPC List */}
            {rpcList.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Saved RPC Endpoints
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {rpcList.map((rpc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border.secondary,
                      }}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FiRadio className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm truncate" title={rpc}>
                          {rpc}
                        </span>
                        {address === rpc && (
                          <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {address !== rpc && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectChain(rpc)}
                            disabled={state === 'submitting'}
                          >
                            Connect
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChain(rpc)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TopNavigation
