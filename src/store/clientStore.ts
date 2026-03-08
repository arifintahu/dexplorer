import { create } from 'zustand'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { Subscription } from 'xstream'

interface ClientState {
  tmClient: Tendermint37Client | null
  subsNewBlock: Subscription | null
  subsTxEvent: Subscription | null
  setTmClient: (client: Tendermint37Client | null) => void
  setSubsNewBlock: (sub: Subscription | null) => void
  setSubsTxEvent: (sub: Subscription | null) => void
  disconnect: () => void
}

export const useClientStore = create<ClientState>((set, get) => ({
  tmClient: null,
  subsNewBlock: null,
  subsTxEvent: null,
  setTmClient: (client) => set({ tmClient: client }),
  setSubsNewBlock: (sub) => set({ subsNewBlock: sub }),
  setSubsTxEvent: (sub) => set({ subsTxEvent: sub }),
  disconnect: () => {
    const { tmClient, subsNewBlock, subsTxEvent } = get()
    if (subsNewBlock) subsNewBlock.unsubscribe()
    if (subsTxEvent) subsTxEvent.unsubscribe()
    if (tmClient) tmClient.disconnect()
    
    set({
      tmClient: null,
      subsNewBlock: null,
      subsTxEvent: null,
    })
  },
}))
