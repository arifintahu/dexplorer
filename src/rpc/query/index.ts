import { Block, IndexedTx, StargateClient } from '@cosmjs/stargate'
import { Tendermint34Client, ValidatorsResponse } from '@cosmjs/tendermint-rpc'

export async function getChainId(
  tmClient: Tendermint34Client
): Promise<string> {
  const client = await StargateClient.create(tmClient)
  return client.getChainId()
}

export async function getValidators(
  tmClient: Tendermint34Client
): Promise<ValidatorsResponse> {
  return tmClient.validatorsAll()
}

export async function getBlock(
  tmClient: Tendermint34Client,
  height: number
): Promise<Block> {
  const client = await StargateClient.create(tmClient)
  return client.getBlock(height)
}

export async function getTx(
  tmClient: Tendermint34Client,
  hash: string
): Promise<IndexedTx | null> {
  const client = await StargateClient.create(tmClient)
  return client.getTx(hash)
}
