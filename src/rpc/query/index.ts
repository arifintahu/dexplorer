import { QueryClient, StargateClient } from '@cosmjs/stargate'
import {
  NewBlockEvent,
  Tendermint34Client,
  TxEvent,
  ValidatorsResponse,
} from '@cosmjs/tendermint-rpc'
import { ReadonlyDate } from 'readonly-date'

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

export function subscribeNewBlock(
  tmClient: Tendermint34Client,
  callback: (event: NewBlockEvent) => any
): void {
  const stream = tmClient.subscribeNewBlock()
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event)
    },
    error: (err) => {
      console.error(err)
      subscription.unsubscribe()
    },
  })
}

export function subscribeTx(
  tmClient: Tendermint34Client,
  callback: (event: TxEvent) => any
): void {
  const stream = tmClient.subscribeTx()
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event)
    },
    error: (err) => {
      console.error(err)
      subscription.unsubscribe()
    },
  })
}
