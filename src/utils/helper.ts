import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { toHex, toBech32, fromBech32 } from '@cosmjs/encoding'
import { sha256 } from '@cosmjs/crypto'
import { bech32 } from 'bech32'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { PubKey as Ed25519PubKey } from 'cosmjs-types/cosmos/crypto/ed25519/keys'

export const timeFromNow = (date: string): string => {
  dayjs.extend(relativeTime)
  const now = dayjs()
  const then = dayjs(date)
  const diffInSeconds = now.diff(then, 'second')

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  }

  const diffInMinutes = now.diff(then, 'minute')
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = now.diff(then, 'hour')
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = now.diff(then, 'day')
  if (diffInDays < 30) {
    return `${diffInDays}d ago`
  }

  return dayjs(date).fromNow()
}

export function trimHash(txHash: Uint8Array): string
export function trimHash(txHash: string, length?: number): string
export function trimHash(txHash: Uint8Array | string, length?: number): string {
  let hash: string

  if (txHash instanceof Uint8Array) {
    hash = toHex(txHash).toUpperCase()
    const first = hash.slice(0, 5)
    const last = hash.slice(hash.length - 5, hash.length)
    return first + '...' + last
  } else {
    hash = txHash.toUpperCase()
    const trimLength = length || 8
    if (hash.length <= trimLength * 2) {
      return hash
    }
    const first = hash.slice(0, trimLength)
    const last = hash.slice(hash.length - trimLength, hash.length)
    return first + '...' + last
  }
}

export const displayDate = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const displayDurationSeconds = (seconds: number | undefined): string => {
  if (!seconds) {
    return ``
  }
  dayjs.extend(duration)
  dayjs.extend(relativeTime)
  return dayjs.duration({ seconds: seconds }).humanize()
}

export const replaceHTTPtoWebsocket = (url: string): string => {
  return url.replace('http', 'ws')
}

export const isBech32Address = (address: string): boolean => {
  try {
    const decoded = bech32.decode(address)
    if (decoded.prefix.includes('valoper')) {
      return false
    }

    if (decoded.words.length < 1) {
      return false
    }

    const encoded = bech32.encode(decoded.prefix, decoded.words)
    return encoded === address
  } catch {
    return false
  }
}

export const convertVotingPower = (tokens: string): string => {
  return Math.round(Number(tokens) / 10 ** 6).toLocaleString(undefined)
}

// Derive a validator's bech32 "valcons" consensus address from its
// consensusPubkey (Cosmos SDK: sha256(rawEd25519Key)[0:20], bech32-encoded
// with the chain's valcons prefix).
export const pubkeyToValconsAddress = (
  consensusPubkey: { typeUrl: string; value: Uint8Array } | undefined,
  operatorAddress: string
): string | null => {
  if (
    !consensusPubkey ||
    consensusPubkey.typeUrl !== '/cosmos.crypto.ed25519.PubKey'
  ) {
    return null
  }
  const { key } = Ed25519PubKey.decode(consensusPubkey.value)
  const addressBytes = sha256(key).slice(0, 20)
  const { prefix } = fromBech32(operatorAddress)
  const valconsPrefix = prefix.replace(/valoper$/, 'valcons')
  return toBech32(valconsPrefix, addressBytes)
}

export const convertRateToPercent = (rate: string | undefined): string => {
  if (!rate) {
    return ``
  }
  const commission = (Number(rate) / 10 ** 16).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${commission}%`
}

export const displayCoin = (deposit: Coin) => {
  if (deposit.denom.startsWith('u')) {
    const amount = Math.round(Number(deposit.amount) / 10 ** 6)
    const symbol = deposit.denom.slice(1).toUpperCase()
    return `${amount.toLocaleString()} ${symbol}`
  }
  return `${Number(deposit.amount).toLocaleString()} ${deposit.denom}`
}

export const getActionFromAttributes = (
  attributes: { key: string; value: string; index?: boolean }[]
) => {
  const action = attributes.find((a) => {
    if (a.key == 'action') {
      return a.value
    }
  })

  if (action) {
    return action.value
  }

  return ''
}

export const getModuleFromAttributes = (
  attributes: { key: string; value: string; index?: boolean }[]
) => {
  const module = attributes.find((a) => {
    if (a.key == 'module') {
      return a.value
    }
  })

  if (module) {
    return module.value
  }

  return ''
}

export const getTypeMsg = (typeUrl: string): string => {
  const arr = typeUrl.split('.')
  if (arr.length) {
    return arr[arr.length - 1].replace('Msg', '')
  }
  return ''
}

export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export const normalizeUrl = (urlString: string): string => {
  if (!urlString.startsWith('https://') && !urlString.startsWith('http://')) {
    return `https://${urlString}`
  }

  return urlString
}

export const getUrlFromPath = (pathString: string): string => {
  const regex = /(?:\?|&)rpc=([^&]+)/
  const match = regex.exec(pathString)
  return match ? decodeURIComponent(match[1]) : ''
}

export function removeTrailingSlash(url: string): string {
  // Check if the URL ends with a trailing slash
  if (url.endsWith('/')) {
    // Remove the trailing slash
    return url.slice(0, -1)
  }
  // Return the URL as is if it doesn't end with a trailing slash
  return url
}

export function isValidJSON(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

// Helper function to safely serialize objects with BigInt values
export const safeStringify = (obj: unknown, space?: number): string => {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString()
      }
      return value
    },
    space
  )
}

// Convert array of objects to CSV string
export const convertToCSV = <T>(
  data: T[],
  headers?: Record<keyof T, string>
): string => {
  if (!data || data.length === 0) return ''

  // Get column headers from first object or use provided headers
  const keys = headers ? Object.keys(headers) : Object.keys(data[0] as object)
  const headerRow = headers
    ? keys.map((k) => headers[k as keyof T]).join(',')
    : keys.join(',')

  // Create data rows
  const rows = data.map((item) => {
    return keys
      .map((key) => {
        const value = item[key as keyof T]
        // Handle values that need quoting
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value ?? '')
      })
      .join(',')
  })

  return [headerRow, ...rows].join('\n')
}

// Download data as a file
export const downloadData = (
  data: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export transactions to CSV
export const exportTransactionsToCSV = (
  transactions: Array<{
    hash: string
    height: string
    timestamp: string
    result: { code: number; data: string | null }
  }>
) => {
  const data = transactions.map((tx) => ({
    hash: tx.hash,
    height: tx.height,
    timestamp: tx.timestamp,
    status: tx.result.code === 0 ? 'success' : 'failed',
  }))

  const csv = convertToCSV(data, {
    hash: 'Hash',
    height: 'Block Height',
    timestamp: 'Timestamp',
    status: 'Status',
  })

  const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`
  downloadData(csv, filename, 'text/csv')
}

// Export transactions to JSON
export const exportTransactionsToJSON = (
  transactions: Array<{
    hash: string
    height: string
    timestamp: string
    result: { code: number; data: string | null }
  }>
) => {
  const data = transactions.map((tx) => ({
    hash: tx.hash,
    height: tx.height,
    timestamp: tx.timestamp,
    status: tx.result.code === 0 ? 'success' : 'failed',
  }))

  const json = safeStringify(data, 2)
  const filename = `transactions_${new Date().toISOString().split('T')[0]}.json`
  downloadData(json, filename, 'application/json')
}

// Export blocks to CSV
export const exportBlocksToCSV = (
  blocks: Array<{
    header: { height: string; time: string }
  }>
) => {
  const data = blocks.map((block) => ({
    height: block.header.height,
    timestamp: block.header.time,
  }))

  const csv = convertToCSV(data, {
    height: 'Block Height',
    timestamp: 'Timestamp',
  })

  const filename = `blocks_${new Date().toISOString().split('T')[0]}.csv`
  downloadData(csv, filename, 'text/csv')
}

// Export blocks to JSON
export const exportBlocksToJSON = (
  blocks: Array<{
    header: { height: string; time: string }
  }>
) => {
  const data = blocks.map((block) => ({
    height: block.header.height,
    timestamp: block.header.time,
  }))

  const json = safeStringify(data, 2)
  const filename = `blocks_${new Date().toISOString().split('T')[0]}.json`
  downloadData(json, filename, 'application/json')
}
