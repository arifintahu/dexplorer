import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectTmClient } from '@/store/connectSlice'
import { selectMintParams, setMintParams } from '@/store/paramsSlice'
import { queryMintParams } from '@/rpc/abci'
import { convertRateToPercent } from '@/utils/helper'

export default function MintParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const params = useSelector(selectMintParams)

  useEffect(() => {
    if (tmClient && !params && !isLoaded) {
      queryMintParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setMintParams(response.params))
          }
          setIsLoaded(true)
        })
        .catch((err) => {
          console.error(err)
          setIsHidden(true)
        })
    }

    if (params) {
      setIsLoaded(true)
    }
  }, [tmClient, params, isLoaded])

  return (
    <Box
      mt={6}
      bg={useColorModeValue('light-container', 'dark-container')}
      shadow={'base'}
      borderRadius={4}
      p={6}
      hidden={isHidden}
    >
      <Flex mb={8} alignItems={'center'} gap={2}>
        <Tooltip
          label="These are values of parameters for minting a block."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color={useColorModeValue('light-theme', 'dark-theme')}
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Minting Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Blocks per Year
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.blocksPerYear.low.toLocaleString() ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Goal Bonded
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.goalBonded)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Max
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationMax)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Min
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationMin)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Rate Change
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationRateChange)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Mint Denom
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.mintDenom ?? ''}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
