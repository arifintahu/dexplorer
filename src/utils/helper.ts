import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { toHex, toBech32, fromBech32 } from '@cosmjs/encoding'
import { sha256 } from '@cosmjs/crypto'
import { bech32 } from 'bech32'
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
