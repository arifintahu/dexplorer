import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num: number | string) => {
  const number = typeof num === 'string' ? parseFloat(num) : num
  return new Intl.NumberFormat().format(number)
}
