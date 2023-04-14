import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import { Subscription } from 'xstream'

// Type for our state
export interface StreamState {
  newBlock: NewBlockEvent | null
  txEvent: TxEvent | null
  subsNewBlock: Subscription | null
  subsTxEvent: Subscription | null
}

// Initial state
const initialState: StreamState = {
  newBlock: null,
  txEvent: null,
  subsNewBlock: null,
  subsTxEvent: null,
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
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.stream,
      }
    },
  },
})

export const { setNewBlock, setTxEvent, setSubsNewBlock, setSubsTxEvent } =
  streamSlice.actions

export const selectNewBlock = (state: AppState) => state.stream.newBlock
export const selectTxEvent = (state: AppState) => state.stream.txEvent

export const selectSubsNewBlock = (state: AppState) => state.stream.subsNewBlock
export const selectSubsTxEvent = (state: AppState) => state.stream.subsTxEvent

export default streamSlice.reducer
