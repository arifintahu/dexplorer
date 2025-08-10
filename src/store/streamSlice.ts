import { createSlice } from '@reduxjs/toolkit'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import { Subscription } from 'xstream'

// Serializable block type
interface SerializableBlock {
  header: {
    height: string
    time: string
    appHash: string
    proposerAddress: string
    [key: string]: any
  }
  txs: any[]
}

// Serializable transaction type
interface SerializableTransaction {
  hash: string
  height: string
  tx: string
  result: any
  timestamp: string
}

// Type for our state
export interface StreamState {
  newBlock: NewBlockEvent | null
  txEvent: TxEvent | null
  subsNewBlock: Subscription | null
  subsTxEvent: Subscription | null
  blocks: SerializableBlock[]
  transactions: SerializableTransaction[]
  totalActiveValidator: number
}

// Helper function to convert Buffer to hex string
const bufferToHex = (buffer: any): string => {
  if (!buffer) return ''
  if (typeof buffer === 'string') return buffer
  if (buffer instanceof Uint8Array) {
    return Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')
  }
  return ''
}

// Helper function to serialize block data
const serializeBlock = (block: NewBlockEvent): SerializableBlock => {
  return {
    header: {
      height: block.header.height.toString(),
      time: block.header.time.toISOString(),
      appHash: bufferToHex(block.header.appHash),
      proposerAddress: bufferToHex(block.header.proposerAddress),
      ...Object.fromEntries(
        Object.entries(block.header).map(([key, value]) => [
          key,
          value instanceof Date
            ? value.toISOString()
            : value &&
              typeof value === 'object' &&
              value.constructor === Uint8Array
            ? bufferToHex(value)
            : value,
        ])
      ),
    },
    txs: Array.from(block.txs || []),
  }
}

// Helper function to serialize transaction data
const serializeTransaction = (txEvent: TxEvent): SerializableTransaction => {
  return {
    hash: bufferToHex(txEvent.hash),
    height: txEvent.height.toString(),
    tx: bufferToHex(txEvent.tx),
    result: txEvent.result,
    timestamp: new Date().toISOString(),
  }
}

// Initial state
const initialState: StreamState = {
  newBlock: null,
  txEvent: null,
  subsNewBlock: null,
  subsTxEvent: null,
  blocks: [],
  transactions: [],
  totalActiveValidator: 0,
}

// Actual Slice
export const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    // Action to set the new block
    setNewBlock(state, action) {
      state.newBlock = action.payload
    },

    // Action to set the tx event
    setTxEvent(state, action) {
      state.txEvent = action.payload
    },

    // Action to set the subs state new block
    setSubsNewBlock(state, action) {
      state.subsNewBlock = action.payload
    },

    // Action to set the subs state tx event
    setSubsTxEvent(state, action) {
      state.subsTxEvent = action.payload
    },

    // Action to add a new block to the persistent blocks array
    addBlock(state, action) {
      const newBlock = action.payload
      const serializedBlock = serializeBlock(newBlock)

      // Check if block already exists to avoid duplicates
      const existingIndex = state.blocks.findIndex(
        (block) => block.header.height === serializedBlock.header.height
      )

      if (existingIndex === -1) {
        // Add new block and keep only the latest 50 blocks
        state.blocks = [serializedBlock, ...state.blocks].slice(0, 50)
      }
    },

    // Action to add a new transaction to the persistent transactions array
    addTransaction(state, action) {
      const newTx = action.payload
      const serializedTx = serializeTransaction(newTx)

      // Check if transaction already exists to avoid duplicates
      const existingIndex = state.transactions.findIndex(
        (tx) => tx.hash === serializedTx.hash
      )

      if (existingIndex === -1) {
        // Add new transaction and keep only the latest 50 transactions
        state.transactions = [serializedTx, ...state.transactions].slice(0, 50)
      }
    },

    // Action to set total active validators
    setTotalActiveValidator(state, action) {
      state.totalActiveValidator = action.payload
    },

    // Action to clear all persistent data
    clearPersistentData(state) {
      state.blocks = []
      state.transactions = []
      state.totalActiveValidator = 0
    },
  },
})

export const {
  setNewBlock,
  setTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
  addBlock,
  addTransaction,
  setTotalActiveValidator,
  clearPersistentData,
} = streamSlice.actions

export const selectNewBlock = (state: any) => state.stream.newBlock
export const selectTxEvent = (state: any) => state.stream.txEvent

export const selectSubsNewBlock = (state: any) => state.stream.subsNewBlock
export const selectSubsTxEvent = (state: any) => state.stream.subsTxEvent
export const selectBlocks = (state: any) => state.stream.blocks
export const selectTransactions = (state: any) => state.stream.transactions
export const selectTotalActiveValidator = (state: any) => state.stream.totalActiveValidator

export default streamSlice.reducer
