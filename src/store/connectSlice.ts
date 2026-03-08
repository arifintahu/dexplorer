import { createSlice } from '@reduxjs/toolkit'

// Type for our state
export interface ConnectState {
  rpcAddress: string
  connectState: boolean
}

// Initial state
const initialState: ConnectState = {
  rpcAddress: '',
  connectState: false,
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
  },
})

export const { setRPCAddress, setConnectState } =
  connectSlice.actions

export const selectRPCAddress = (state: any) => state.connect.rpcAddress
export const selectConnectState = (state: any) => state.connect.connectState

export default connectSlice.reducer
