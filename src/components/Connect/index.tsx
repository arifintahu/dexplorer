import React, { FormEvent, ChangeEvent, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { FiZap, FiCheck } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { setConnectState, setRPCAddress } from '@/store/connectSlice'
import {
  setNewBlock,
  setTxEvent,
  addBlock,
  addTransaction,
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
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import { removeTrailingSlash } from '@/utils/helper'
import { useClientStore } from '@/store/clientStore'
import { config } from '@/config'

const chainList = [
  {
    name: 'Cosmos Hub',
    rpc: 'https://rpc.cosmos.nodestake.org',
  },
  {
    name: 'Osmosis',
    rpc: 'https://rpc-osmosis.ecostake.com',
  },
]

export default function Connect() {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [error, setError] = useState(false)
  const dispatch = useDispatch()
  const { colors } = useTheme()

  // Use client store
  const { setTmClient, setSubsNewBlock, setSubsTxEvent, disconnect } =
    useClientStore()

  // Bypass mode check
  const { rpcAddress: rpcEnv, chainName: chainNameEnv, isBypassMode } = config

  useEffect(() => {
    const initConnection = async () => {
      if (isBypassMode && state === 'initial') {
        await connectClient(rpcEnv)
      } else if (!isBypassMode && state === 'initial') {
        // Auto-reconnect if RPC address exists in localStorage
        const savedRpcAddress = window.localStorage.getItem(LS_RPC_ADDRESS)
        if (savedRpcAddress) {
          setAddress(savedRpcAddress)
          await connectClient(savedRpcAddress)
        }
      }
    }

    initConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const addr = removeTrailingSlash(address)
    await connectClient(addr)
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

      // Clean up existing subscriptions and connections before establishing new ones
      disconnect()

      // Reset stream data
      dispatch(setNewBlock(null))
      dispatch(setTxEvent(null))

      // Reset parameters data
      dispatch(setStakingParams(null))
      dispatch(setMintParams(null))
      dispatch(setDistributionParams(null))
      dispatch(setSlashingParams(null))
      dispatch(setGovVotingParams(null))
      dispatch(setGovDepositParams(null))
      dispatch(setGovTallyParams(null))

      const tmClient = await connectWebsocketClient(rpcAddress)
      setTmClient(tmClient)

      // Set global state
      dispatch(setRPCAddress(rpcAddress))
      dispatch(setConnectState(true))

      // Save to local storage
      localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)

      // Save to history
      let savedRPCList = []
      try {
        const list = localStorage.getItem(LS_RPC_ADDRESS_LIST)
        if (list) {
          savedRPCList = JSON.parse(list)
        }
      } catch (e) {
        console.error('Error parsing RPC list', e)
      }

      if (!savedRPCList.includes(rpcAddress)) {
        savedRPCList.push(rpcAddress)
        localStorage.setItem(LS_RPC_ADDRESS_LIST, JSON.stringify(savedRPCList))
      }

      setState('success')

      // Subscribe to events
      const subsNewBlock = subscribeNewBlock(tmClient, (block) => {
        dispatch(setNewBlock(block))
        dispatch(addBlock(block))
      })
      setSubsNewBlock(subsNewBlock)

      const subsTx = subscribeTx(tmClient, (tx) => {
        dispatch(setTxEvent(tx))
        dispatch(addTransaction(tx))
      })
      setSubsTxEvent(subsTx)
    } catch (e) {
      console.error(e)
      setError(true)
      setState('initial')
    }
  }

  const selectChain = (rpcAddress: string) => {
    setAddress(rpcAddress)
    connectClient(rpcAddress)
  }

  // Bypass mode render
  if (isBypassMode) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="flex flex-col items-center p-8 rounded-xl"
          style={{ backgroundColor: colors.surface }}
        >
          <FiZap
            className="w-12 h-12 mb-4 animate-pulse"
            style={{ color: colors.primary }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            Connecting to {chainNameEnv || 'Network'}...
          </h2>
          <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
            {rpcEnv}
          </p>
          {error && (
            <div className="text-red-500 flex items-center gap-2 mt-2">
              <span>Connection failed. Please check RPC_ADDRESS.</span>
              <Button size="sm" onClick={() => connectClient(rpcEnv)}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: colors.text.primary }}
          >
            Connect to <span style={{ color: colors.primary }}>RPC</span>
          </h1>
          <p className="mb-8" style={{ color: colors.text.secondary }}>
            Connect to a Cosmos RPC endpoint to start exploring the blockchain.
          </p>
        </div>

        <form onSubmit={submitForm} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              required
              placeholder="https://rpc.cosmos.network:443"
              value={address}
              disabled={state !== 'initial'}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAddress(e.target.value)
              }
              className="flex-1 px-4 py-3.5 rounded-xl disabled:opacity-50 transition-all duration-300 connect-input shadow-md focus:shadow-lg focus:scale-[1.02]"
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${colors.border.primary}`,
                color: colors.text.primary,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                outline: 'none',
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
            <p className="text-sm mt-2" style={{ color: colors.status.error }}>
              Failed to connect. Please check the RPC address.
            </p>
          )}
        </form>

        <div className="text-center">
          <p className="mb-4" style={{ color: colors.text.secondary }}>
            Or select from popular chains:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {chainList.map((chain) => (
              <Button
                key={chain.name}
                onClick={() => selectChain(chain.rpc)}
                disabled={state !== 'initial'}
                variant="secondary"
                size="md"
                title={chain.name}
              >
                <FiZap style={{ color: colors.primary }} />
                <span className="text-sm font-medium">{chain.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
