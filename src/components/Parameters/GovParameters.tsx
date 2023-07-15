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
import {
  selectGovVotingParams,
  selectGovDepositParams,
  selectGovTallyParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} from '@/store/paramsSlice'
import { queryGovParams } from '@/rpc/abci'
import {
  displayDurationSeconds,
  convertRateToPercent,
  displayCoin,
} from '@/utils/helper'
import { fromUtf8 } from '@cosmjs/encoding'
import { GOV_PARAMS_TYPE } from '@/utils/constant'

export default function GovParameters() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useDispatch()
  const tmClient = useSelector(selectTmClient)
  const votingParams = useSelector(selectGovVotingParams)
  const depositParams = useSelector(selectGovDepositParams)
  const tallyParams = useSelector(selectGovTallyParams)

  useEffect(() => {
    if (
      tmClient &&
      !votingParams &&
      !depositParams &&
      !tallyParams &&
      !isLoaded
    ) {
      Promise.all([
        queryGovParams(tmClient, GOV_PARAMS_TYPE.VOTING),
        queryGovParams(tmClient, GOV_PARAMS_TYPE.DEPOSIT),
        queryGovParams(tmClient, GOV_PARAMS_TYPE.TALLY),
      ])
        .then((responses) => {
          if (responses[0].votingParams) {
            dispatch(setGovVotingParams(responses[0].votingParams))
          }
          if (responses[1].depositParams) {
            dispatch(setGovDepositParams(responses[1].depositParams))
          }
          if (responses[2].tallyParams) {
            dispatch(setGovTallyParams(responses[2].tallyParams))
          }
          setIsLoaded(true)
        })
        .catch((err) => {
          console.error(err)
          setIsHidden(true)
        })
    }

    if (votingParams && depositParams && tallyParams) {
      setIsLoaded(true)
    }
  }, [tmClient, votingParams, depositParams, tallyParams, isLoaded])

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
          label="These are values of parameters for governance proposal."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color={useColorModeValue('light-theme', 'dark-theme')}
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Governance Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Min Deposit
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {depositParams?.minDeposit.length
                ? displayCoin(depositParams?.minDeposit[0])
                : ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Max Deposit Period
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(
                depositParams?.maxDepositPeriod?.seconds.low
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Voting Period
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {displayDurationSeconds(votingParams?.votingPeriod?.seconds.low)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Quorum
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(tallyParams?.quorum ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Threshold
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(tallyParams?.threshold ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Veto Threshold
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(
                fromUtf8(tallyParams?.vetoThreshold ?? new Uint8Array())
              )}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>
    </Box>
  )
}
