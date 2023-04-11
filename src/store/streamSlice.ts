import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'

// Type for our state
export interface StreamState {
  newBlock: NewBlockEvent | null
  txEvent: TxEvent | null
}

// Initial state
const initialState: StreamState = {
  newBlock: null,
  txEvent: null,
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

export const { setNewBlock, setTxEvent } = streamSlice.actions

export const selectNewBlock = (state: AppState) => state.stream.newBlock
export const selectTxEvent = (state: AppState) => state.stream.txEvent

export default streamSlice.reducer
