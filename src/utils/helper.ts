import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { toHex } from '@cosmjs/encoding'
import { bech32 } from 'bech32'

export const timeFromNow = (date: string): string => {
  dayjs.extend(relativeTime)
  return dayjs(date).fromNow()
}

export const trimHash = (txHash: Uint8Array): string => {
  const hash = toHex(txHash).toUpperCase()
  const first = hash.slice(0, 5)
  const last = hash.slice(hash.length - 5, hash.length)
  return first + '...' + last
}

export const displayDate = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const replaceHTTPtoWebsocket = (url: string): string => {
  return url.replace('http', 'ws')
}

export const isBech32Address = (address: string): Boolean => {
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
  } catch (e) {
    return false
  }
}

export const convertVotingPower = (tokens: string): string => {
  return Math.round(Number(tokens) / 10 ** 6).toLocaleString(undefined)
}

export const convertCommissionToPercent = (
  rate: string | undefined
): string => {
  if (!rate) {
    return ``
  }
  const commission = (Number(rate) / 10 ** 16).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${commission}%`
}
