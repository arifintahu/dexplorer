export const getColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-success'
    case 'pending':
      return 'text-danger'
    case 'error':
      return 'text-error'
    default:
      return 'gray.500' // Default color if status is unknown
  }
}
export const getRelativeTime = (timestamp: string | Date): string => {
  const now = new Date()
  const pastDate = new Date(timestamp)
  const timeDifference = now.getTime() - pastDate.getTime() // Difference in milliseconds

  const minutes = Math.floor(timeDifference / (1000 * 60))
  const hours = Math.floor(timeDifference / (1000 * 60 * 60))
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export const truncate = (hash: string, length: number = 5): string => {
  // Ensure the hash is long enough for truncation
  if (hash.length <= length * 2) {
    return hash // No truncation if the hash is too short
  }

  // Get the first and last 'length' characters
  const start = hash.slice(0, length)
  const end = hash.slice(-length)

  // Return the truncated hash
  return `${start}...${end}`
}

export const capitalizeFirstLetter = (word: string): string => {
  if (!word) return '' // Handle empty or null strings
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export const fetchBitcoinPriceDifference = async () => {
  try {
    // Get the current Bitcoin price
    const currentPriceResponse = await fetch(
      'https://api.coindesk.com/v1/bpi/currentprice/BTC.json'
    )
    const currentPriceData = await currentPriceResponse.json()
    const currentPrice = currentPriceData.bpi.USD.rate_float

    // Get yesterday's date in the format YYYY-MM-DD
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDateString = yesterday.toISOString().split('T')[0]

    // Fetch Bitcoin price for yesterday
    const historicalPriceResponse = await fetch(
      `https://api.coindesk.com/v1/bpi/historical/close.json?start=${yesterdayDateString}&end=${yesterdayDateString}`
    )
    const historicalPriceData = await historicalPriceResponse.json()
    const yesterdayPrice = historicalPriceData.bpi[yesterdayDateString]

    // Calculate the difference
    const priceDifference = currentPrice - yesterdayPrice
    const differencePercentage = (
      (priceDifference / yesterdayPrice) *
      100
    ).toFixed(2)

    return {
      currentPrice,
      yesterdayPrice,
      priceDifference,
      differencePercentage,
    }
  } catch (error) {
    console.error('Error fetching Bitcoin prices:', error)
    return null
  }
}
