import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { QueryClient } from '@cosmjs/stargate'
import { PageRequest } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination'
import {
  QueryValidatorsRequest,
  QueryValidatorsResponse,
  QueryParamsRequest as QueryStakingParamsRequest,
  QueryParamsResponse as QueryStakingParamsResponse,
} from 'cosmjs-types/cosmos/staking/v1beta1/query'
import {
  QueryParamsRequest as QueryMintParamsRequest,
  QueryParamsResponse as QueryMintParamsResponse,
} from 'cosmjs-types/cosmos/mint/v1beta1/query'
import {
  QueryProposalsRequest,
  QueryProposalsResponse,
  QueryParamsRequest as QueryGovParamsRequest,
  QueryParamsResponse as QueryGovParamsResponse,
} from 'cosmjs-types/cosmos/gov/v1beta1/query'
import {
  QueryParamsRequest as QueryDistributionParamsRequest,
  QueryParamsResponse as QueryDistributionParamsResponse,
} from 'cosmjs-types/cosmos/distribution/v1beta1/query'
import {
  QueryParamsRequest as QuerySlashingParamsRequest,
  QueryParamsResponse as QuerySlashingParamsResponse,
} from 'cosmjs-types/cosmos/slashing/v1beta1/query'

export async function queryActiveValidators(
  tmClient: Tendermint37Client,
  page: number,
  perPage: number
): Promise<QueryValidatorsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryValidatorsRequest.encode({
    status: 'BOND_STATUS_BONDED',
    pagination: PageRequest.fromJSON({
      offset: page * perPage,
      limit: perPage,
      countTotal: true,
    }),
  }).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.staking.v1beta1.Query/Validators',
    req
  )
  return QueryValidatorsResponse.decode(value)
}

export async function queryProposals(
  tmClient: Tendermint37Client,
  page: number,
  perPage: number
): Promise<QueryProposalsResponse> {
  const queryClient = new QueryClient(tmClient)
  const proposalsRequest = QueryProposalsRequest.fromPartial({
    pagination: PageRequest.fromJSON({
      offset: page * perPage,
      limit: perPage,
      countTotal: true,
      reverse: true,
    }),
  })
  const req = QueryProposalsRequest.encode(proposalsRequest).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.gov.v1beta1.Query/Proposals',
    req
  )
  return QueryProposalsResponse.decode(value)
}

export async function queryStakingParams(
  tmClient: Tendermint37Client
): Promise<QueryStakingParamsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryStakingParamsRequest.encode({}).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.staking.v1beta1.Query/Params',
    req
  )
  return QueryStakingParamsResponse.decode(value)
}

export async function queryMintParams(
  tmClient: Tendermint37Client
): Promise<QueryMintParamsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryMintParamsRequest.encode({}).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.mint.v1beta1.Query/Params',
    req
  )
  return QueryMintParamsResponse.decode(value)
}

export async function queryGovParams(
  tmClient: Tendermint37Client,
  paramsType: string
): Promise<QueryGovParamsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryGovParamsRequest.encode({
    paramsType: paramsType,
  }).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.gov.v1beta1.Query/Params',
    req
  )
  return QueryGovParamsResponse.decode(value)
}

export async function queryDistributionParams(
  tmClient: Tendermint37Client
): Promise<QueryDistributionParamsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryDistributionParamsRequest.encode({}).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.distribution.v1beta1.Query/Params',
    req
  )
  return QueryDistributionParamsResponse.decode(value)
}

export async function querySlashingParams(
  tmClient: Tendermint37Client
): Promise<QuerySlashingParamsResponse> {
  const queryClient = new QueryClient(tmClient)
  const req = QuerySlashingParamsRequest.encode({}).finish()
  const { value } = await queryClient.queryAbci(
    '/cosmos.slashing.v1beta1.Query/Params',
    req
  )
  return QuerySlashingParamsResponse.decode(value)
}
