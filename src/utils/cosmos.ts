/**
 * Utility functions for Cosmos ecosystem denomination conversion
 */

/**
 * Convert amount from micro units (divide by 10^6)
 * @param amount - The amount string to convert
 * @returns Converted amount with 6 decimal places
 */
export const convertFromMicroUnits = (amount: string): string => {
  const num = parseFloat(amount)
  return (num / 1e6).toFixed(6)
}

/**
 * Convert amount from atto units (divide by 10^18)
 * @param amount - The amount string to convert
 * @returns Converted amount with 18 decimal places
 */
export const convertFromAttoUnits = (amount: string): string => {
  const num = parseFloat(amount)
  return (num / 1e18).toFixed(18)
}

/**
 * Get base denomination by removing prefix
 * @param denom - The denomination string
 * @returns Base denomination without prefix
 */
export const getBaseDenom = (denom: string): string => {
  if (denom.startsWith('u')) {
    return denom.slice(1) // Remove 'u' prefix
  }
  if (denom.startsWith('a')) {
    return denom.slice(1) // Remove 'a' prefix
  }
  return denom
}

/**
 * Convert amount based on denomination prefix and return both converted amount and base denomination
 * @param amount - The amount string to convert
 * @param denom - The denomination string
 * @returns Object with converted amount and base denomination
 */
export const getConvertedAmount = (amount: string, denom: string): { converted: string; base: string } => {
  if (denom.startsWith('u')) {
    return {
      converted: convertFromMicroUnits(amount),
      base: getBaseDenom(denom)
    }
  }
  if (denom.startsWith('a')) {
    return {
      converted: convertFromAttoUnits(amount),
      base: getBaseDenom(denom)
    }
  }
  return {
    converted: amount,
    base: denom
  }
}

/**
 * Format amount with appropriate suffix (B, M, K) based on size
 * @param amount - The amount string to format
 * @returns Formatted amount string with suffix
 */
export const formatAmount = (amount: string) => {
  const num = parseFloat(amount)
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 6 })
}

/**
 * Format IBC denomination by truncating with ellipsis
 * @param denom - The denomination string to format
 * @returns Formatted denomination string
 */
export const formatDenom = (denom: string) => {
  if (denom.startsWith('ibc/')) {
    return denom.slice(0, 12) + '...'
  }
  return denom
}

/**
 * Extract unique sender addresses from transaction events
 * @param events - Array of transaction events with type and attributes
 * @returns Array of unique sender addresses
 */
export const getSendersFromEvents = (events: any[]): string[] => {
  if (!events || !Array.isArray(events)) {
    return []
  }

  const senders: string[] = []

  events.forEach((event) => {
    if (event?.type === 'message' && event?.attributes && Array.isArray(event.attributes)) {
      event.attributes.forEach((attr: { key: string; value: string }) => {
        if (attr?.key === 'sender' && attr?.value && typeof attr.value === 'string') {
          senders.push(attr.value)
        }
      })
    }
  })

  // Return unique senders
  return [...new Set(senders)]
}