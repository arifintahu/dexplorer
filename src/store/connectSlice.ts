import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'

// Type for our state
export interface ConnectState {
  rpcAddress: string
  connectState: boolean
  tmClient: Tendermint34Client | null
}

// Initial state
const initialState: ConnectState = {
  rpcAddress: '',
  connectState: false,
  tmClient: null,
}

// Actual Slice
export const connectSlice = createSlice({
  name: 'connect',
  initialState,
  reducers: {
    // Action to set the address
    setRPCAddress(state, action) {
      state.rpcAddress = action.payload
    },
    // Action to set the connection status
    setConnectState(state, action) {
      state.connectState = action.payload
    },
    // Action to set the client
    setTmClient(state, action) {
      state.tmClient = action.payload
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.connect,
      }
    },
  },
})

export const { setRPCAddress, setConnectState, setTmClient } =
  connectSlice.actions

export const selectRPCAddress = (state: AppState) => state.connect.rpcAddress
export const selectConnectState = (state: AppState) =>
  state.connect.connectState
export const selectTmClient = (state: AppState) => state.connect.tmClient

export default connectSlice.reducer
