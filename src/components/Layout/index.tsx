import { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../Sidebar'
import Connect from '../Connect'
import LoadingPage from '../LoadingPage'
import Navbar from '../Navbar'
import {
  selectConnectState,
  selectTmClient,
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import {
  setNewBlock,
  selectNewBlock,
  setTxEvent,
  selectTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
} from '@/store/streamSlice'
import { NewBlockEvent } from '@cosmjs/tendermint-rpc'
import { TxEvent } from '@cosmjs/tendermint-rpc/build/tendermint37'
import {
  LS_RPC_ADDRESS,
  LS_RPC_ADDRESS_LIST,
  RPC_ADDRESS,
} from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'
import { NextRouter, useRouter } from 'next/router'
import { getUrlFromPath, isValidUrl, normalizeUrl } from '@/utils/helper'

export default function Layout({ children }: { children: ReactNode }) {
  const connectState = useSelector(selectConnectState)
  const tmClient = useSelector(selectTmClient)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const dispatch = useDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [error, setError] = useState(false)
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )

  useEffect(() => {
    if (tmClient && !newBlock) {
      const subscription = subscribeNewBlock(tmClient, updateNewBlock)
      dispatch(setSubsNewBlock(subscription))
    }

    if (tmClient && !txEvent) {
      const subscription = subscribeTx(tmClient, updateTxEvent)
      dispatch(setSubsTxEvent(subscription))
    }
  }, [tmClient, newBlock, txEvent, dispatch])

  useEffect(() => {
    if (isLoading) {
      selectChain(RPC_ADDRESS ?? '')

      const address = window.localStorage.getItem(LS_RPC_ADDRESS)
      if (!address) {
        setIsLoading(false)
        return
      }

      window.localStorage.setItem(LS_RPC_ADDRESS, address)
    }
  }, [isLoading])

  const updateNewBlock = (event: NewBlockEvent): void => {
    dispatch(setNewBlock(event))
  }

  const updateTxEvent = (event: TxEvent): void => {
    dispatch(setTxEvent(event))
  }

  const getQueryUrl = (router: NextRouter): string => {
    if (router.route !== '/') {
      return ''
    }

    const url = getUrlFromPath(router.asPath)
    if (!isValidUrl(url)) {
      return ''
    }
    return url
  }

  const connectClient = async (rpcAddress: string) => {
    debugger
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

      const tmClient = await connectWebsocketClient(rpcAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))
      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.localStorage.setItem(
        LS_RPC_ADDRESS_LIST,
        JSON.stringify([rpcAddress])
      )
      setIsLoading(false)
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

  return (
    <>
      {isLoading ? <LoadingPage /> : <></>}
      {connectState && !isLoading ? (
        <Sidebar>
          <Navbar />
          {children}
        </Sidebar>
      ) : (
        <></>
      )}
      {/* {!connectState && !isLoading ? <Connect /> : <></>} */}
    </>
  )
}
