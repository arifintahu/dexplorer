import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'

// Type for our state
export interface ConnectState {
  connectState: boolean
}

// Initial state
const initialState: ConnectState = {
  connectState: false,
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

export const { setConnectState } = connectSlice.actions

export const selecConnectState = (state: AppState) => state.connect.connectState

export default connectSlice.reducer
