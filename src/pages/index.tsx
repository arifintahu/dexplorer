import '@/styles/Home.module.css'

import { InfoOutlineIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  FlexProps,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import RecentBlocks from '@/components/RecentBlocks'
import TransactionList from '@/components/TransactionList'
import { getValidators } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { selectNewBlock } from '@/store/streamSlice'
import { displayDate } from '@/utils/helper'
import { images } from '@/utils/images'

export default function Home() {
  const tmClient = useSelector(selectTmClient)
  const newBlock = useSelector(selectNewBlock)
  const [validators, setValidators] = useState<number>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>()

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
      getValidators(tmClient).then((response) => setValidators(response.total))
    }
  }, [tmClient])

  useEffect(() => {
    if ((!isLoaded && newBlock) || (!isLoaded && status)) {
      setIsLoaded(true)
    }
  }, [isLoaded, newBlock, status])
  console.log(
    status?.syncInfo.latestBlockHeight,
    'status?.syncInfo.latestBlockHeight'
  )
  console.log(newBlock?.header.height, 'newBlock?.header.height')
  return (
    <>
      <Head>
        <title>Home | Surge Explorer</title>
        <meta name="description" content="Home | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="home_main">
        <Image
          src={images.pattern.src}
          position="absolute"
          pointerEvents={'none'}
          w={'full'}
          left={0}
          top={0}
          maxHeight={'430px'}
          alt="pattern"
        />
        <Box position="relative">
          <Text
            fontSize="40px"
            lineHeight="52px"
            color={'white'}
            fontWeight="bold"
          >
            Surge Explorer
          </Text>
          <Box mt={7} mb={8}>
            <SimpleGrid minChildWidth="200px" spacing="20px">
              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  bgColor="green.200"
                  color="green.600"
                  name="TOTAL TXNS"
                  value={
                    newBlock?.header.time
                      ? displayDate(newBlock?.header.time?.toISOString())
                      : status?.syncInfo.latestBlockTime
                      ? displayDate(
                          status?.syncInfo.latestBlockTime.toISOString()
                        )
                      : ''
                  }
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>

              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="TOTAL INSCRIPTIONS"
                  value={
                    newBlock?.header.height
                      ? '#' + newBlock?.header.height
                      : '#' + status?.syncInfo.latestBlockHeight
                  }
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>
              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="LATEST BLOCK"
                  value={
                    newBlock?.header.height
                      ? '#' + newBlock?.header.height
                      : '#' + status?.syncInfo.latestBlockHeight
                  }
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>
              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="MAX TPS"
                  value={
                    newBlock?.header.height
                      ? '#' + newBlock?.header.height
                      : '#' + status?.syncInfo.latestBlockHeight
                  }
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>
            </SimpleGrid>
          </Box>
          <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={10}>
            <GridItem colSpan={7}>
              <TransactionList title="Transactions" />
            </GridItem>
            <GridItem
              colSpan={5}
              bg="dark-bg"
              px={7}
              pt={10}
              pb={6}
              borderRadius={12}
              border={'1px'}
              borderColor={'gray-900'}
            >
              <RecentBlocks />
            </GridItem>
          </Grid>
        </Box>
      </main>
    </>
  )
}

interface BoxInfoProps extends FlexProps {
  name: string
  value: string | number | undefined
  tooltipText: string
}
const BoxInfo = ({ name, value, tooltipText }: BoxInfoProps) => {
  return (
    <VStack
      bg={'gray-1000'}
      borderRadius={12}
      p={4}
      pb={2}
      height="100px"
      border={'1px'}
      borderColor={'gray-900'}
      align={'flex-start'}
    >
      <HStack mb={'14px'}>
        <Heading size={'xs'} color={'gray-500'} fontWeight={500}>
          {name}
        </Heading>
        <Tooltip
          label={tooltipText}
          placement="right"
          bg="gray.300"
          color="black"
        >
          <Icon as={InfoOutlineIcon} w={'13px'} color="gray-500" />
        </Tooltip>
      </HStack>

      <Text fontSize={'2xl'} color={'white'} fontWeight={500}>
        {value}
      </Text>
    </VStack>
  )
}
