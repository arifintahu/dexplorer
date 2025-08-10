import React, { FormEvent, ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiZap, FiCheck, FiLoader } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { Button } from '@/components/ui/Button'
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
import { RootState } from '@/store'

const chainList = [
  {
    name: 'Cosmos Hub',
    rpc: 'https://cosmos-rpc.stakeandrelax.net',
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

  // Get current subscriptions and tmClient from Redux store
  const currentSubsNewBlock = useSelector(
    (state: RootState) => state.stream.subsNewBlock
  )
  const currentSubsTxEvent = useSelector(
    (state: RootState) => state.stream.subsTxEvent
  )
  const currentTmClient = useSelector(
    (state: RootState) => state.connect.tmClient
  )

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
      if (currentSubsNewBlock) {
        currentSubsNewBlock.unsubscribe()
        dispatch(setSubsNewBlock(null))
      }
      if (currentSubsTxEvent) {
        currentSubsTxEvent.unsubscribe()
        dispatch(setSubsTxEvent(null))
      }
      if (currentTmClient) {
        try {
          currentTmClient.disconnect()
        } catch (error) {
          console.warn('Error disconnecting previous tmClient:', error)
        }
      }

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

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))

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

      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.localStorage.setItem(
        LS_RPC_ADDRESS_LIST,
        JSON.stringify([rpcAddress])
      )
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const selectChain = (rpcAddress: string) => {
    setAddress(rpcAddress)
    connectClient(rpcAddress)
  }

  React.useEffect(() => {
    // Auto-reconnect if RPC address exists in localStorage
    const savedRpcAddress = window.localStorage.getItem(LS_RPC_ADDRESS)
    if (savedRpcAddress && state === 'initial') {
      setAddress(savedRpcAddress)
      connectClient(savedRpcAddress)
    }
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
