import {
  Account,
  Block,
  Coin,
  IndexedTx,
  StargateClient,
} from '@cosmjs/stargate'
import { Tendermint37Client, ValidatorsResponse } from '@cosmjs/tendermint-rpc'
import { LS_RPC_ADDRESS } from '@/utils/constant'

const clientCache = new WeakMap<Tendermint37Client, Promise<StargateClient>>()

async function getClient(
  tmClient: Tendermint37Client
): Promise<StargateClient> {
  if (!clientCache.has(tmClient)) {
    clientCache.set(tmClient, StargateClient.create(tmClient))
  }
  return clientCache.get(tmClient)!
}

export async function getChainId(
  tmClient: Tendermint37Client
): Promise<string> {
  const client = await getClient(tmClient)
  return client.getChainId()
}

export async function getNetworkStatus(tmClient: Tendermint37Client): Promise<{
  chainId: string
  blockHeight: number
  syncHeight: number
  catchingUp: boolean
  peered: number
  blockInterval: string
}> {
  // Get tendermint status for sync info
  const status = await tmClient.status()
  const chainId = status.nodeInfo.network
  const syncInfo = status.syncInfo

  // Block height from sync info
  const blockHeight = Number(syncInfo.latestBlockHeight)

  // Calculate block interval from block timestamps
  let blockInterval = '< 1s'
  if (syncInfo.latestBlockTime && syncInfo.earliestBlockTime) {
    const latestTime = new Date(syncInfo.latestBlockTime.toString()).getTime()
    const earliestTime = new Date(
      syncInfo.earliestBlockTime.toString()
    ).getTime()
    const interval = (latestTime - earliestTime) / 1000
    if (interval < 1) {
      blockInterval = '< 1s'
    } else {
      blockInterval = `${interval.toFixed(1)}s`
    }
  }

  // Get real peer count from RPC net_info endpoint
  let peered = 0
  try {
    const rpcAddress =
      typeof window !== 'undefined'
        ? localStorage.getItem(LS_RPC_ADDRESS)
        : null
    if (rpcAddress) {
      const response = await fetch(rpcAddress, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'netinfo',
          method: 'net_info',
          params: {},
        }),
      })
      const data = await response.json()
      if (data.result?.n_peers !== undefined) {
        peered = data.result.n_peers
      }
    }
  } catch {
    // net_info request failed, leave peered as 0
  }

  return {
    chainId,
    blockHeight,
    syncHeight: blockHeight,
    catchingUp: syncInfo.catchingUp,
    peered,
    blockInterval,
  }
}

export async function getValidators(
  tmClient: Tendermint37Client
): Promise<ValidatorsResponse> {
  return tmClient.validatorsAll()
}

export async function getBlock(
  tmClient: Tendermint37Client,
  height: number
): Promise<Block> {
  const client = await getClient(tmClient)
  const [block, rawBlock] = await Promise.all([
    client.getBlock(height),
    tmClient.block(height),
  ])

  // StargateClient's typed BlockHeader omits appHash/proposerAddress even
  // though the raw Tendermint response always carries them — merge the real
  // bytes in so consumers reading block.header.appHash/proposerAddress get
  // actual data instead of undefined. The extra fields aren't part of the
  // BlockHeader type, so this is cast back to Block; existing consumers
  // already read them via their own `as unknown as {...}` cast.
  const header: Block['header'] & {
    appHash: Uint8Array
    proposerAddress: Uint8Array
  } = {
    ...block.header,
    appHash: rawBlock.block.header.appHash,
    proposerAddress: rawBlock.block.header.proposerAddress,
  }

  return { ...block, header } as Block
}

export async function getTx(
  tmClient: Tendermint37Client,
  hash: string
): Promise<IndexedTx | null> {
  const client = await getClient(tmClient)
  return client.getTx(hash)
}

export async function getAccount(
  tmClient: Tendermint37Client,
  address: string
): Promise<Account | null> {
  const client = await getClient(tmClient)
  return client.getAccount(address)
}

export async function getAllBalances(
  tmClient: Tendermint37Client,
  address: string
): Promise<readonly Coin[]> {
  const client = await getClient(tmClient)
  return client.getAllBalances(address)
}

export async function getBalanceStaked(
  tmClient: Tendermint37Client,
  address: string
): Promise<Coin | null> {
  const client = await getClient(tmClient)
  return client.getBalanceStaked(address)
}

export async function getTxsBySender(
  tmClient: Tendermint37Client,
  address: string,
  page: number,
  perPage: number
) {
  // Validate address format before using it in query to prevent injection attacks
  // The regex checks for valid bech32 format ( Cosmos addresses )
  const validAddressRegex = /^[a-z\d]+1[a-z\d]{38,58}$/
  if (!validAddressRegex.test(address)) {
    throw new Error('Invalid address format for transaction search')
  }

  // Use the validated address directly - it's already confirmed to be safe bech32 format
  return tmClient.txSearch({
    query: `message.sender='${address}'`,
    prove: true,
    order_by: 'desc',
    page: page,
    per_page: perPage,
  })
}
