import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { toHex } from '@cosmjs/encoding'

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
