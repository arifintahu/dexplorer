import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'

// Type for our state
export interface ConnectState {
  connectState: boolean
  client: Tendermint34Client | null
}

// Initial state
const initialState: ConnectState = {
  connectState: false,
  client: null,
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
    // Action to set the tendermint client
    setClient(state, action) {
      state.client = action.payload
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

export const { setConnectState, setClient } = connectSlice.actions

export const selectConnectState = (state: AppState) =>
  state.connect.connectState
export const selectClient = (state: AppState) => state.connect.client

export default connectSlice.reducer
