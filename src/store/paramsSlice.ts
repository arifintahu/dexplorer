import { createSlice } from '@reduxjs/toolkit'
import { AppState } from './index'
import { HYDRATE } from 'next-redux-wrapper'
import { Params as StakingParams } from 'cosmjs-types/cosmos/staking/v1beta1/staking'
import { Params as MintParams } from 'cosmjs-types/cosmos/mint/v1beta1/mint'

// Type for our state
export interface ParamsState {
  stakingParams: StakingParams | null
  mintParams: MintParams | null
}

// Initial state
const initialState: ParamsState = {
  stakingParams: null,
  mintParams: null,
}

// Actual Slice
export const paramsSlice = createSlice({
  name: 'params',
  initialState,
  reducers: {
    setStakingParams(state, action) {
      state.stakingParams = action.payload
    },
    setMintParams(state, action) {
      state.mintParams = action.payload
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.params,
      }
    },
  },
})

export const { setStakingParams, setMintParams } = paramsSlice.actions

export const selectStakingParams = (state: AppState) =>
  state.params.stakingParams
export const selectMintParams = (state: AppState) => state.params.mintParams

export default paramsSlice.reducer
