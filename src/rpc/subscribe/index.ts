import { NewBlockEvent, Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { TxEvent } from '@cosmjs/tendermint-rpc/build/tendermint37'
import { Subscription } from 'xstream'

export function subscribeNewBlock(
  tmClient: Tendermint37Client,
  callback: (event: NewBlockEvent) => any
): Subscription {
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

  return subscription
}

export function subscribeTx(
  tmClient: Tendermint37Client,
  callback: (event: TxEvent) => any
): Subscription {
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

  return subscription
}
