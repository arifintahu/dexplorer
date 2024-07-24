import { replaceHTTPtoWebsocket } from '@/utils/helper'
import { Tendermint37Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
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
): Promise<Tendermint37Client> {
  return new Promise(async (resolve, reject) => {
    try {
      const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
      const wsClient = new WebsocketClient(wsUrl, (err) => {
        reject(err)
      })
      const tmClient = await Tendermint37Client.create(wsClient)
      if (!tmClient) {
        reject(new Error('cannot create tendermint client'))
      }

      const status = await tmClient.status()
      if (!status) {
        reject(new Error('cannot get client status'))
      }

      resolve(tmClient)
    } catch (err) {
      reject(err)
    }
  })
}
