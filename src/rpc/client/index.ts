import { replaceHTTPtoWebsocket } from '@/utils/helper'
import { Tendermint34Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
import { StreamingSocket } from '@cosmjs/socket'

export async function validateConnection(rpcAddress: string): Promise<Boolean> {
  return new Promise((resolve) => {
    const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
    const path = wsUrl.endsWith('/') ? 'websocket' : '/websocket'
    const socket = new StreamingSocket(wsUrl + path, 3000)
    socket.events.subscribe({
      error: () => {
        resolve(false)
      },
    })

    socket.connect()
    socket.connected.then(() => resolve(true)).catch(() => resolve(false))
  })
}

export async function connectWebsocketClient(
  rpcAddress: string
): Promise<Tendermint34Client | null> {
  try {
    const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
    const wsClient = new WebsocketClient(wsUrl, (err) => {
      console.error(err)
      return null
    })
    const tmClient = await Tendermint34Client.create(wsClient)
    if (!tmClient) {
      return null
    }

    const status = await tmClient.status()
    if (!status) {
      return null
    }

    return tmClient
  } catch (error) {
    console.error(error)
    return null
  }
}
