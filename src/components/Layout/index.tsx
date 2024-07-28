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
import { LS_RPC_ADDRESS } from '@/utils/constant'
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
      const url = getQueryUrl(router)
      if (url.length) {
        const address = normalizeUrl(url)
        connect(address)
        return
      }

      const address = window.localStorage.getItem(LS_RPC_ADDRESS)
      if (!address) {
        setIsLoading(false)
        return
      }

      connect(address)
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

  const connect = async (address: string) => {
    try {
      const isValid = await validateConnection(address)
      if (!isValid) {
        window.localStorage.removeItem(LS_RPC_ADDRESS)
        setIsLoading(false)
        return
      }

      const tmClient = await connectWebsocketClient(address)
      if (!tmClient) {
        window.localStorage.removeItem(LS_RPC_ADDRESS)
        setIsLoading(false)
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(address))

      setIsLoading(false)
      window.localStorage.setItem(LS_RPC_ADDRESS, address)
    } catch (err) {
      console.error(err)
      window.localStorage.removeItem(LS_RPC_ADDRESS)
      setIsLoading(false)
      return
    }
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
      {!connectState && !isLoading ? <Connect /> : <></>}
    </>
  )
}
