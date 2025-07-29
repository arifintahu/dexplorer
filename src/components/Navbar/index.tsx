import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectTmClient, selectRPCAddress } from '@/store/connectSlice'
import {
  FiRadio,
  FiSearch,
  FiRefreshCcw,
  FiZap,
  FiTrash2,
  FiMoon,
  FiSun,
  FiCheck,
  FiX,
} from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'
import { useTheme } from '@/theme/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

export default function Navbar() {
  const navigate = useNavigate()
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const { colors, isDark, toggleTheme } = useTheme()
  const [status, setStatus] = useState<StatusResponse | null>()

  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState(false)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isRPCModalOpen, setIsRPCModalOpen] = useState(false)

  const [inputSearch, setInputSearch] = useState('')
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)
  const [rpcList, setRPCList] = useState<string[]>([])

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
    }
  }, [tmClient])

  useEffect(() => {
    if (newBlock || status) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, status])

  const handleInputSearch = (event: any) => {
    setInputSearch(event.target.value as string)
  }

  const handleSearch = () => {
    if (!inputSearch) {
      toast.warning('Please enter a value!')
      return
    }

    if (heightRegex.test(inputSearch)) {
      navigate('/blocks/' + inputSearch)
    } else if (txhashRegex.test(inputSearch)) {
      navigate('/txs/' + inputSearch)
    } else if (addrRegex.test(inputSearch)) {
      navigate('/accounts/' + inputSearch)
    } else {
      toast.error('Invalid Height, Transaction or Account Address!')
      return
    }
    setTimeout(() => {
      setIsSearchOpen(false)
    }, 500)
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const rpcAddresses = getRPCList()
    const addr = removeTrailingSlash(newAddress)
    if (rpcAddresses.includes(addr)) {
      toast.warning('This RPC Address is already in the list!')
      return
    }
    await connectClient(addr)
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify([addr, ...rpcAddresses])
    )
    setRPCList(getRPCList())
  }

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      const tc = await connectWebsocketClient(rpcAddress)

      if (!tc) {
        setError(true)
        setState('initial')
        return
      }

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.location.reload()
      setState('success')
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const getRPCList = () => {
    const rpcAddresses = JSON.parse(
      window.localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
    )
    return rpcAddresses
  }

  const onChangeRPC = () => {
    setRPCList(getRPCList())
    setState('initial')
    setNewAddress('')
    setError(false)
    setIsRPCModalOpen(true)
  }

  const selectChain = (rpcAddress: string) => {
    connectClient(rpcAddress)
  }

  const removeChain = (rpcAddress: string) => {
    const rpcList = getRPCList()
    const updatedList = rpcList.filter((rpc: string) => rpc !== rpcAddress)
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify(updatedList)
    )
    setRPCList(getRPCList())
  }

  return (
    <>
      <div
        className="w-full p-4 shadow-md rounded-lg mb-4 flex justify-between items-center"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="flex items-center space-x-4">
          <FiRadio className="text-3xl text-green-600" />
          <div
            className="flex items-center space-x-4 border rounded-md p-2"
            style={{ borderColor: colors.border.primary }}
          >
            <div>
              {isLoadedSkeleton ? (
                <>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {newBlock?.header.chainId
                      ? newBlock?.header.chainId
                      : status?.nodeInfo.network}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    {address}
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="h-4 w-24 rounded animate-pulse mb-1"
                    style={{ backgroundColor: colors.border.primary }}
                  ></div>
                  <div
                    className="h-3 w-32 rounded animate-pulse"
                    style={{ backgroundColor: colors.border.primary }}
                  ></div>
                </>
              )}
            </div>
            <button
              onClick={onChangeRPC}
              className="p-2 rounded-md hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colors.primary, color: 'white' }}
              aria-label="Change RPC"
            >
              <FiRefreshCcw className="text-lg" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: colors.text.primary }}
            aria-label="Search"
          >
            <FiSearch className="text-lg" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: colors.text.primary }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <FiSun className="text-lg" />
            ) : (
              <FiMoon className="text-lg" />
            )}
          </button>
        </div>
      </div>
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Search
              </h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md hover:opacity-80 transition-opacity"
                style={{ color: colors.text.secondary }}
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Height/Transaction/Account Address"
                onChange={handleInputSearch}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border.primary,
                  color: colors.text.primary,
                }}
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="primary"
              size="lg"
              className="w-full"
            >
              CONFIRM
            </Button>
          </div>
        </div>
      )}

      {/* RPC Modal */}
      {isRPCModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-xl font-semibold"
                style={{ color: colors.text.primary }}
              >
                Change Connection
              </h2>
              <button
                onClick={() => setIsRPCModalOpen(false)}
                className="p-1 rounded-md hover:opacity-80 transition-opacity"
                style={{ color: colors.text.secondary }}
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Add new RPC form */}
            <form onSubmit={submitForm} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="url"
                  required
                  placeholder="Connect to new RPC Address"
                  value={newAddress}
                  disabled={state !== 'initial'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewAddress(e.target.value)
                  }
                  className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border.primary,
                    color: colors.text.primary,
                  }}
                />
                <Button
                  type={state === 'success' ? 'button' : 'submit'}
                  disabled={state !== 'initial'}
                  variant={state === 'success' ? 'success' : 'primary'}
                  size="lg"
                  loading={state === 'submitting'}
                >
                  {state === 'success' && <FiCheck />}
                  {state === 'initial' && 'Connect'}
                  {state === 'submitting' && 'Connecting...'}
                  {state === 'success' && 'Connected'}
                </Button>
              </div>
              {error && (
                <p
                  className="text-sm mt-2 text-center"
                  style={{ color: colors.status.error }}
                >
                  Oh no, cannot connect to websocket client! 😢
                </p>
              )}
            </form>

            {/* Available RPCs */}
            <div>
              <h3
                className="text-center font-semibold mb-4"
                style={{ color: colors.text.primary }}
              >
                Available RPCs
              </h3>
              <div className="space-y-3">
                {rpcList.map((rpc) => (
                  <div
                    key={rpc}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{
                      borderColor: colors.border.primary,
                      backgroundColor: colors.background,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm break-all"
                        style={{ color: colors.text.primary }}
                      >
                        {rpc}
                      </p>
                    </div>
                    {rpc !== address ? (
                      <div className="flex space-x-2 ml-3">
                        <button
                          onClick={() => selectChain(rpc)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                          }}
                          aria-label="Connect RPC"
                        >
                          <FiZap className="text-sm" />
                        </button>
                        <button
                          onClick={() => removeChain(rpc)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: colors.status.error,
                            color: 'white',
                          }}
                          aria-label="Remove RPC"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-sm font-semibold ml-3"
                        style={{ color: colors.status.success }}
                      >
                        Connected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
