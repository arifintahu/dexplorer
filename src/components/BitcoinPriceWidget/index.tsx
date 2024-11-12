import {
  ChevronDownIcon,
  ChevronUpIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons'
import { Box, Icon, Img, Text, VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'

import { images } from '@/utils/images'

export default function BitcoinPriceDifference() {
  const [priceData, setPriceData] = useState({
    currentPrice: null as number | null,
    yesterdayPrice: null as number | null,
    priceDifference: null as number | null,
    differencePercentage: null as string | null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBitcoinPriceDifference = useCallback(async () => {
    try {
      const currentPriceResponse = await fetch(
        'https://api.coindesk.com/v1/bpi/currentprice/BTC.json'
      )
      const currentPriceData = await currentPriceResponse.json()
      const currentPrice = currentPriceData.bpi.USD.rate_float

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDateString = yesterday.toISOString().split('T')[0]

      const historicalPriceResponse = await fetch(
        `https://api.coindesk.com/v1/bpi/historical/close.json?start=${yesterdayDateString}&end=${yesterdayDateString}`
      )
      const historicalPriceData = await historicalPriceResponse.json()
      const yesterdayPrice = historicalPriceData.bpi[yesterdayDateString]

      const priceDifference = currentPrice - yesterdayPrice
      const differencePercentage = (
        (priceDifference / yesterdayPrice) *
        100
      ).toFixed(2)

      setPriceData({
        currentPrice,
        yesterdayPrice,
        priceDifference,
        differencePercentage,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching Bitcoin prices:', error)
      setError('Failed to fetch data')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBitcoinPriceDifference()
  }, [fetchBitcoinPriceDifference])

  const getPercentageColor = (percentage: string | null) => {
    if (!percentage) return 'gray.500'
    return parseFloat(percentage) >= 0 ? 'green.500' : 'red.500'
  }

  const renderTriangleIcon = (percentage: string | null) => {
    if (!percentage) return null
    return parseFloat(percentage) >= 0 ? (
      <TriangleUpIcon color="green.500" fontSize={'14px'} />
    ) : (
      <TriangleDownIcon color="red.500" />
    )
  }

  return (
    <div>
      {loading ? (
        <Text color={'white'}>Loading...</Text>
      ) : error ? (
        <Text color={'red'}>{error}</Text>
      ) : (
        <Box display={'flex'} gap={2} alignItems={'center'}>
          <Img src={images.bitcoinLogo.src} width={8} height={8} />
          <VStack gap={'0px'} alignItems={'start'}>
            <Text
              fontSize={'sm'}
              fontWeight={'semibold'}
              color={'text-50'}
            >{`$ ${priceData.currentPrice?.toFixed(2)}`}</Text>
            <Box display="flex" alignItems="center">
              {renderTriangleIcon(priceData.differencePercentage)}
              <Text
                fontSize={'sm'}
                color={getPercentageColor(priceData.differencePercentage)}
                ml={1}
              >
                {`${priceData.differencePercentage}% 1D`}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}
    </div>
  )
}
