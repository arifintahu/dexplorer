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
import { selectSlashingParams, setSlashingParams } from '@/store/paramsSlice'
import { querySlashingParams } from '@/rpc/abci'
import { displayDurationSeconds, convertRateToPercent } from '@/utils/helper'
import { fromUtf8 } from '@cosmjs/encoding'

export default function SlashingParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const params = useSelector(selectSlashingParams)

  useEffect(() => {
    if (tmClient && !params && !isLoaded) {
      querySlashingParams(tmClient)
        .then((response) => {
          if (response.params) {
            dispatch(setSlashingParams(response.params))
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
          label="These are values of parameters for slashing decided by the foundation."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color={useColorModeValue('light-theme', 'dark-theme')}
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Slashing Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Signed Blocks Window
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.signedBlocksWindow.low.toLocaleString() ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Min Signed Per Window
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.minSignedPerWindow ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Downtime Jail Duration
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(
                params?.downtimeJailDuration?.seconds.low
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Slash Fraction Doublesign
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.slashFractionDoubleSign ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Slash Fraction Downtime
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(params?.slashFractionDowntime ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
