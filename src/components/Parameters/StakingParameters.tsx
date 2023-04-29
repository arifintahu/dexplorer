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
import { selectStakingParams, setStakingParams } from '@/store/paramsSlice'
import { queryStakingParams } from '@/rpc/abci'
import { displayDurationSeconds } from '@/utils/helper'

export default function StakingParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const params = useSelector(selectStakingParams)

  useEffect(() => {
    if (tmClient && !params && !isLoaded) {
      queryStakingParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setStakingParams(response.params))
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
      bg={useColorModeValue('white', 'gray.900')}
      shadow={'base'}
      borderRadius={4}
      p={6}
      hidden={isHidden}
    >
      <Flex mb={8} alignItems={'center'} gap={2}>
        <Tooltip
          label="These are values of parameters for staking the token including details of token policy."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color={'gray.600'}
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Staking Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Unbonding Time
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(params?.unbondingTime?.seconds?.low)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Max Validators
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.maxValidators ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Max Entries
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.maxEntries ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Historical Entries
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.historicalEntries.toLocaleString() ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Bond Denom
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.bondDenom ?? ''}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
