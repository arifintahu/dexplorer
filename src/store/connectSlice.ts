import { createSlice } from '@reduxjs/toolkit'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'

// Type for our state
export interface ConnectState {
  rpcAddress: string
  connectState: boolean
  tmClient: Tendermint37Client | null
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
})

export const { setRPCAddress, setConnectState, setTmClient } =
  connectSlice.actions

export const selectRPCAddress = (state: any) => state.connect.rpcAddress
export const selectConnectState = (state: any) => state.connect.connectState
export const selectTmClient = (state: any) => state.connect.tmClient

export default connectSlice.reducer
