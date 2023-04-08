import { QueryClient, StargateClient } from '@cosmjs/stargate'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import { ReadonlyDate } from 'readonly-date'

export async function getChainId(
  tmClient: Tendermint34Client
): Promise<string> {
  const client = await StargateClient.create(tmClient)
  return client.getChainId()
}

export interface ResponseDashboard {
  latestBlockHeight: number
  latestBlockTime: ReadonlyDate
  totalValidators: number
  network: string
}
export async function getDashboard(
  tmClient: Tendermint34Client
): Promise<ResponseDashboard> {
  const status = await tmClient.status()
  const validators = await tmClient.validatorsAll()

  return {
    latestBlockHeight: status.syncInfo.latestBlockHeight,
    latestBlockTime: status.syncInfo.latestBlockTime,
    totalValidators: validators.count,
    network: status.nodeInfo.network,
  }
}
