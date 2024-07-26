import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { toHex } from '@cosmjs/encoding'
import { bech32 } from 'bech32'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'

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

export const getTypeMsg = (typeUrl: string): string => {
  const arr = typeUrl.split('.')
  if (arr.length) {
    return arr[arr.length - 1].replace('Msg', '')
  }
  return ''
}

export const isValidUrl = (urlString: string): Boolean => {
  var urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // validate fragment locator
  return !!urlPattern.test(urlString)
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
