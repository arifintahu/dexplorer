import { createSlice } from '@reduxjs/toolkit'
import { Params as StakingParams } from 'cosmjs-types/cosmos/staking/v1beta1/staking'
import { Params as MintParams } from 'cosmjs-types/cosmos/mint/v1beta1/mint'
import { Params as DistributionParams } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution'
import { Params as SlashingParams } from 'cosmjs-types/cosmos/slashing/v1beta1/slashing'
import {
  VotingParams,
  DepositParams,
  TallyParams,
} from 'cosmjs-types/cosmos/gov/v1/gov'

// Type for our state
export interface ParamsState {
  stakingParams: StakingParams | null
  mintParams: MintParams | null
  distributionParams: DistributionParams | null
  slashingParams: SlashingParams | null
  govVotingParams: VotingParams | null
  govDepositParams: DepositParams | null
  govTallyParams: TallyParams | null
}

// Initial state
const initialState: ParamsState = {
  stakingParams: null,
  mintParams: null,
  distributionParams: null,
  slashingParams: null,
  govVotingParams: null,
  govDepositParams: null,
  govTallyParams: null,
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
    setDistributionParams(state, action) {
      state.distributionParams = action.payload
    },
    setSlashingParams(state, action) {
      state.slashingParams = action.payload
    },
    setGovVotingParams(state, action) {
      state.govVotingParams = action.payload
    },
    setGovDepositParams(state, action) {
      state.govDepositParams = action.payload
    },
    setGovTallyParams(state, action) {
      state.govTallyParams = action.payload
    },
  },
})

export const {
  setStakingParams,
  setMintParams,
  setDistributionParams,
  setSlashingParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} = paramsSlice.actions

export const selectStakingParams = (state: any) => state.params.stakingParams
export const selectMintParams = (state: any) => state.params.mintParams
export const selectDistributionParams = (state: any) =>
  state.params.distributionParams
export const selectSlashingParams = (state: any) => state.params.slashingParams
export const selectGovVotingParams = (state: any) =>
  state.params.govVotingParams
export const selectGovDepositParams = (state: any) =>
  state.params.govDepositParams
export const selectGovTallyParams = (state: any) => state.params.govTallyParams

export default paramsSlice.reducer
