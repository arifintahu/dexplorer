import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  setConnectState,
  setRPCAddress,
  selectRPCAddress,
} from '@/store/connectSlice'
import {
  setNewBlock,
  setTxEvent,
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
  FiMenu,
  FiMoon,
  FiRefreshCcw,
  FiSearch,
  FiSun,
  FiX,
  FiRadio,
  FiCheck,
  FiTrash2,
  FiZap,
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'
import { toast } from 'sonner'
import { useClientStore } from '@/store/clientStore'
import { config } from '@/config'

interface TopNavigationProps {
  onMenuClick?: () => void
}

const getPageMeta = (pathname: string) => {
  if (pathname === '/') {
    return {
      title: 'Network Overview',
      subtitle: 'Real-time Cosmos Hub activity',
    }
  }

  if (pathname === '/blocks') {
    return { title: 'Blocks', subtitle: 'Latest blocks produced on chain' }
  }

  if (pathname.startsWith('/blocks/')) {
    return { title: 'Block', subtitle: 'Block details and transactions' }
  }

  if (pathname === '/txs') {
    return {
      title: 'Transactions',
      subtitle: 'Recent transactions across the chain',
    }
  }

  if (pathname.startsWith('/txs/')) {
    return {
      title: 'Transaction',
      subtitle: 'Transaction details and messages',
    }
  }

  if (pathname === '/accounts') {
    return { title: 'Accounts', subtitle: 'Recent account activity' }
  }

  if (pathname.startsWith('/accounts/')) {
    return { title: 'Account', subtitle: 'Balances, activity, and holdings' }
  }

  if (pathname === '/validators') {
    return { title: 'Validators', subtitle: 'Active validator set' }
  }

  if (pathname.startsWith('/validators/')) {
    return { title: 'Validator', subtitle: 'Validator metadata and status' }
  }

  if (pathname === '/proposals') {
    return { title: 'Governance', subtitle: 'On-chain proposals and voting' }
  }

  if (pathname.startsWith('/proposals/')) {
    return { title: 'Proposal', subtitle: 'Governance proposal details' }
  }

  if (pathname === '/ibc-transfers') {
    return { title: 'IBC Transfers', subtitle: 'Cross-chain token transfers' }
  }

  if (pathname === '/parameters') {
    return {
      title: 'Chain Parameters',
      subtitle: 'Module configuration values',
    }
  }

  return { title: 'Dexplorer', subtitle: 'Cosmos network explorer' }
}

const getConnectionLabel = (address: string, chainName: string) => {
  if (chainName) {
    return chainName
  }

  if (!address) {
    return 'Not connected'
  }

  try {
    return new URL(address).hostname
  } catch {
    return address
  }
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuClick }) => {
  const { colors, colorScheme, toggleColorScheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const { setTmClient, setSubsNewBlock, setSubsTxEvent, disconnect } =
    useClientStore()
  const address = useSelector(selectRPCAddress)
  const { chainName: chainNameEnv, isBypassMode } = config

  const [searchQuery, setSearchQuery] = useState('')
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState(false)
  const [isRPCModalOpen, setIsRPCModalOpen] = useState(false)
  const [rpcList, setRPCList] = useState<string[]>([])

  const meta = useMemo(() => {
    if (!connectState) {
      return {
        title: 'Connect',
        subtitle: 'Connect to a Cosmos RPC endpoint',
      }
    }

    return getPageMeta(location.pathname)
  }, [connectState, location.pathname])

  const heightRegex = /^\d+$/
  const txhashRegex = /^[A-Za-z\d]{64}$/
  const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

  useEffect(() => {
    const savedRPCList = localStorage.getItem(LS_RPC_ADDRESS_LIST)
    if (savedRPCList) {
      try {
        setRPCList(JSON.parse(savedRPCList))
      } catch (loadError) {
        console.error('Error parsing RPC list from localStorage:', loadError)
      }
    }
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!searchQuery.trim()) return

    if (heightRegex.test(searchQuery)) {
      navigate(`/blocks/${searchQuery}`)
    } else if (txhashRegex.test(searchQuery)) {
      navigate(`/txs/${searchQuery}`)
    } else if (addrRegex.test(searchQuery)) {
      navigate(`/accounts/${searchQuery}`)
    } else {
      toast.error('Invalid search query format')
    }

    setSearchQuery('')
  }

  const resetApplicationData = async () => {
    disconnect()
    dispatch(setNewBlock(null))
    dispatch(setTxEvent(null))
    dispatch(clearPersistentData())
    dispatch(setStakingParams(null))
    dispatch(setMintParams(null))
    dispatch(setDistributionParams(null))
    dispatch(setSlashingParams(null))
    dispatch(setGovVotingParams(null))
    dispatch(setGovDepositParams(null))
    dispatch(setGovTallyParams(null))
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

      await resetApplicationData()
      await new Promise((resolve) => setTimeout(resolve, 100))

      const tmClient = await connectWebsocketClient(cleanAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        toast.error('Failed to establish connection')
        return
      }

      setTmClient(tmClient)
      dispatch(setRPCAddress(cleanAddress))
      dispatch(setConnectState(true))
      setState('success')

      const newBlockSub = subscribeNewBlock(
        tmClient,
        (event) => {
          dispatch(setNewBlock(event))
          dispatch(addBlock(event))
        },
        (err) => {
          console.error('Block subscription failed:', err)
          toast.error('Block updates stopped. Please check your connection.')
        }
      )

      const txSub = subscribeTx(
        tmClient,
        (event) => {
          dispatch(setTxEvent(event))
          dispatch(addTransaction(event))
        },
        (err) => {
          console.error('Transaction subscription failed:', err)
          toast.error(
            'Transaction updates stopped. Please check your connection.'
          )
        }
      )

      setSubsNewBlock(newBlockSub)
      setSubsTxEvent(txSub)

      localStorage.setItem(LS_RPC_ADDRESS, cleanAddress)

      let currentList: string[] = []
      try {
        const stored = localStorage.getItem(LS_RPC_ADDRESS_LIST)
        if (stored) {
          currentList = JSON.parse(stored)
        }
      } catch {
        currentList = []
      }

      const updatedList = currentList.includes(cleanAddress)
        ? [
            cleanAddress,
            ...currentList.filter((entry) => entry !== cleanAddress),
          ]
        : [cleanAddress, ...currentList]

      localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(updatedList))
      setRPCList(updatedList)
      setIsRPCModalOpen(false)
      setNewAddress('')
      toast.success('Successfully connected to RPC endpoint')
    } catch (connectionError) {
      console.error('Connection error:', connectionError)
      setError(true)
      setState('initial')
      toast.error('Connection failed')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newAddress.trim()) {
      void connectClient(newAddress.trim())
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewAddress(event.target.value)
    if (error) setError(false)
  }

  const removeChain = (rpcAddress: string) => {
    const updatedList = rpcList.filter((addr) => addr !== rpcAddress)
    setRPCList(updatedList)
    localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(updatedList))
    toast.success('RPC address removed')
  }

  const handleDisconnect = async () => {
    await resetApplicationData()
    dispatch(setConnectState(false))
    dispatch(setRPCAddress(''))
    localStorage.removeItem(LS_RPC_ADDRESS)
    toast.success('Disconnected from RPC endpoint')
  }

  const connectionLabel = getConnectionLabel(address, chainNameEnv)

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{
          backgroundColor:
            colorScheme === 'dark'
              ? 'rgba(7, 9, 13, 0.88)'
              : 'rgba(244, 247, 251, 0.88)',
          borderColor: colors.border.primary,
        }}
      >
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-4 px-4 py-3 lg:px-6">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="sm"
            aria-label="Open menu"
            className="lg:hidden"
            style={{ color: colors.text.primary }}
          >
            <FiMenu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <h1
              className="truncate font-heading text-[1.45rem] font-semibold leading-none"
              style={{ color: colors.text.primary }}
            >
              {meta.title}
            </h1>
            <div
              className="mt-1 text-sm"
              style={{ color: colors.text.tertiary }}
            >
              {meta.subtitle}
            </div>
          </div>

          <div className="ml-auto flex min-w-[170px] flex-1 flex-wrap items-center justify-end gap-3 sm:min-w-0">
            <form
              onSubmit={handleSearch}
              className="order-last w-full max-w-full flex-1 basis-full sm:order-none sm:w-auto sm:max-w-[420px] sm:basis-auto md:min-w-[280px]"
            >
              <div className="relative">
                <FiSearch
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: colors.text.tertiary }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search address / tx / block..."
                  aria-label="Search address, transaction, or block"
                  className="shell-input h-10 w-full rounded-[14px] py-2 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    borderColor: colors.border.primary,
                    backgroundColor: colors.surface,
                    color: colors.text.primary,
                    boxShadow: `0 0 0 0 transparent`,
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.boxShadow = `0 0 0 4px ${colors.primary}1f`
                    event.currentTarget.style.borderColor = `${colors.primary}66`
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.boxShadow = '0 0 0 0 transparent'
                    event.currentTarget.style.borderColor =
                      colors.border.primary
                  }}
                />
              </div>
            </form>

            <Button
              onClick={toggleColorScheme}
              variant="secondary"
              size="sm"
              aria-label={`Switch to ${colorScheme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${colorScheme === 'light' ? 'dark' : 'light'} mode`}
              className="h-10 w-10 rounded-[14px] p-0"
            >
              {colorScheme === 'dark' ? (
                <FiSun className="h-4 w-4" />
              ) : (
                <FiMoon className="h-4 w-4" />
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                if (!isBypassMode) {
                  setIsRPCModalOpen(true)
                }
              }}
              className="flex min-h-10 items-center gap-2 rounded-[14px] border px-3 py-2.5 text-sm font-semibold sm:px-4"
              disabled={isBypassMode}
              style={{
                borderColor: connectState
                  ? `${colors.status.success}88`
                  : `${colors.status.error}88`,
                backgroundColor: connectState
                  ? `${colors.status.success}14`
                  : `${colors.status.error}12`,
                color: connectState
                  ? colors.status.success
                  : colors.status.error,
                cursor: isBypassMode ? 'default' : 'pointer',
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: connectState
                    ? colors.status.success
                    : colors.status.error,
                }}
              />
              <span className="hidden sm:inline">
                {connectState ? 'Connected' : 'Disconnected'}
              </span>
              <span className="sr-only sm:hidden">
                {connectState ? 'Connected' : 'Disconnected'}
              </span>
            </button>

            {connectState && !isBypassMode && (
              <Button
                onClick={() => {
                  void handleDisconnect()
                }}
                variant="secondary"
                size="sm"
                className="min-h-10 rounded-[14px] px-3 font-semibold sm:px-5"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </header>

      {isRPCModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
          <div
            className="w-full max-w-xl rounded-[28px] border p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border.primary,
              boxShadow: colors.shadow.lg,
            }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3
                  className="font-heading text-2xl font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  RPC Connection
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.tertiary }}
                >
                  {connectState
                    ? `Connected to ${connectionLabel}. Add, switch, or remove Cosmos RPC endpoints.`
                    : 'Add, switch, or remove Cosmos RPC endpoints.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRPCModalOpen(false)}
              >
                <FiX className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label
                htmlFor="rpc-endpoint-url"
                className="block text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                RPC Endpoint URL
              </label>
              <input
                id="rpc-endpoint-url"
                type="url"
                value={newAddress}
                onChange={handleInputChange}
                placeholder="https://rpc.example.com"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: error
                    ? colors.status.error
                    : colors.border.primary,
                  color: colors.text.primary,
                }}
                aria-invalid={error}
                aria-describedby={error ? 'rpc-endpoint-error' : undefined}
              />
              {error && (
                <p
                  id="rpc-endpoint-error"
                  role="alert"
                  className="text-sm"
                  style={{ color: colors.status.error }}
                >
                  Failed to connect to this RPC endpoint.
                </p>
              )}
              <Button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full rounded-2xl"
                size="lg"
              >
                {state === 'submitting' ? (
                  <>
                    <FiRefreshCcw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiZap className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </form>

            {rpcList.length > 0 && (
              <div className="mt-6">
                <div
                  className="mb-3 text-sm font-semibold"
                  style={{ color: colors.text.secondary }}
                >
                  Saved RPC Endpoints
                </div>
                <div className="space-y-2">
                  {rpcList.map((rpc) => (
                    <div
                      key={rpc}
                      className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border.primary,
                      }}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FiRadio
                          className="h-4 w-4 shrink-0"
                          style={{ color: colors.primary }}
                        />
                        <div className="min-w-0">
                          <div
                            className="truncate text-sm font-medium"
                            style={{ color: colors.text.primary }}
                            title={rpc}
                          >
                            {rpc}
                          </div>
                          {address === rpc && (
                            <div
                              className="mt-1 flex items-center gap-1 text-xs"
                              style={{ color: colors.status.success }}
                            >
                              <FiCheck className="h-3 w-3" />
                              Active
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {address !== rpc && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              void connectClient(rpc)
                            }}
                          >
                            Connect
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChain(rpc)}
                          style={{ color: colors.status.error }}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  Need an RPC URL? Browse chain metadata in the{' '}
                  <a
                    href="https://cosmos.directory"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: colors.primary }}
                  >
                    Cosmos Directory
                  </a>
                  .
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
