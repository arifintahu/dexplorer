import { replaceHTTPtoWebsocket, isValidUrl } from '@/utils/helper'
import { Tendermint37Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
import { StreamingSocket } from '@cosmjs/socket'

export async function validateConnection(rpcAddress: string): Promise<boolean> {
  // Check if URL is valid format first
  if (!isValidUrl(rpcAddress)) {
    console.error('Invalid URL format:', rpcAddress)
    return false
  }

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
    socket.connected
      .then(() => resolve(true))
      .catch((err) => {
        console.error('Connection validation failed:', err)
        resolve(false)
      })
  })
}

export async function connectWebsocketClient(
  rpcAddress: string
): Promise<Tendermint37Client> {
  // Check if URL is valid format first
  if (!isValidUrl(rpcAddress)) {
    throw new Error('Invalid RPC URL format')
  }

  return new Promise((resolve, reject) => {
    try {
      const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
      const wsClient = new WebsocketClient(wsUrl, (err) => {
        reject(err)
      })
      Tendermint37Client.create(wsClient)
        .then(async (tmClient) => {
          if (!tmClient) {
            reject(new Error('cannot create tendermint client'))
            return
          }

          try {
            const status = await tmClient.status()
            if (!status) {
              reject(new Error('cannot get client status'))
              return
            }
            resolve(tmClient)
          } catch (err) {
            reject(err)
          }
        })
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}
