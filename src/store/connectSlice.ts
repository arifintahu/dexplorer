import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { StargateClient } from '@cosmjs/stargate'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'

// Type for our state
export interface ConnectState {
  connectState: boolean
  client: StargateClient | null
  tmClient: Tendermint34Client | null
}

// Initial state
const initialState: ConnectState = {
  connectState: false,
  client: null,
  tmClient: null,
}

// Actual Slice
export const connectSlice = createSlice({
  name: 'connect',
  initialState,
  reducers: {
    // Action to set the connection status
    setConnectState(state, action) {
      state.connectState = action.payload
    },
    // Action to set the client
    setClient(state, action) {
      state.client = action.payload
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

export const { setConnectState, setClient, setTmClient } = connectSlice.actions

export const selectConnectState = (state: AppState) =>
  state.connect.connectState
export const selectClient = (state: AppState) => state.connect.client
export const selectTmClient = (state: AppState) => state.connect.tmClient

export default connectSlice.reducer
