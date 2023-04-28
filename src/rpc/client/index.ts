import { replaceHTTPtoWebsocket } from '@/utils/helper'
import { Tendermint34Client, WebsocketClient } from '@cosmjs/tendermint-rpc'

export async function validateConnection(rpcAddress: string): Promise<Boolean> {
  try {
    const tmClient = await Tendermint34Client.connect(rpcAddress)
    const status = await tmClient.status()
    if (!status) {
      return false
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
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
