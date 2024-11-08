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
import { BoxInfo } from '@/components/shared/BoxInfo'
import TransactionList from '@/components/TransactionList'
import {
  getTotalInscriptions,
  getTxsByRestApi,
  getValidators,
} from '@/rpc/query'
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
  const [totalInscription, setTotalInscription] = useState<number>(0)

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
      getValidators(tmClient).then((response) => setValidators(response.total))
    }
  }, [tmClient])

  // Function to handle the interval call
  async function checkBitcoinData() {
    const length = await getTotalInscriptions()
    setTotalInscription(length)
  }

  useEffect(() => {
    const intervalId = setInterval(checkBitcoinData, 5000)
    // Example usage:
    const restEndpoint = 'https://rpc.devnet.surge.dev'

    // Query parameters
    const params = {
      events: "message.sender='sender_address'",
      'pagination.limit': '100',
      order_by: 'ORDER_BY_DESC',
    }

    const transactions = getTxsByRestApi(restEndpoint, params)
    console.log('Transactions:', transactions)
  }, [])

  useEffect(() => {
    if ((!isLoaded && newBlock) || (!isLoaded && status)) {
      setIsLoaded(true)
    }
  }, [isLoaded, newBlock, status])

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
                  value={totalInscription}
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
              <TransactionList title="Transactions" showAll={false} />
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
