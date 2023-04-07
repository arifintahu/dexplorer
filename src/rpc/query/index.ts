import { QueryClient, StargateClient } from '@cosmjs/stargate'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'

export async function getChainId(
  tmClient: Tendermint34Client
): Promise<string> {
  const client = await StargateClient.create(tmClient)
  return client.getChainId()
}

export interface ResponseDashboard {
  height: number
}
export async function getDashboard(
  tmClient: Tendermint34Client
): Promise<ResponseDashboard> {
  const client = await StargateClient.create(tmClient)
  const height = await client.getHeight()

  return {
    height,
  }
}
