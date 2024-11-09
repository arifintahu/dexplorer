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
import { toHex } from '@cosmjs/encoding'
import { StatusResponse, TxEvent } from '@cosmjs/tendermint-rpc'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
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
import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'
import { displayDate } from '@/utils/helper'
import { images } from '@/utils/images'

interface Tx {
  TxEvent: TxEvent
  Timestamp: Date
}

const MAX_ROWS = 20

export default function Home() {
  const tmClient = useSelector(selectTmClient)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const [validators, setValidators] = useState<number>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>()
  const [totalInscription, setTotalInscription] = useState<number>(0)
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
      getValidators(tmClient).then((response) => setValidators(response.total))
    }
  }, [tmClient])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  const updateTxs = (txEvent: TxEvent) => {
    console.log({ txEvent })
    if (!txEvent.result.data) {
      return
    }

    const data = TxBody.decode(txEvent.result.data)

    const tx = {
      TxEvent: txEvent,
      Timestamp: new Date(),
      data: data,
      height: txEvent.height,
      hash: toHex(txEvent.hash).toUpperCase(),
    }
    if (txs.length) {
      if (
        txEvent.height >= txs[0].TxEvent.height &&
        txEvent.hash != txs[0].TxEvent.hash
      ) {
        setTxs((prevTx) => [tx, ...prevTx.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setTxs([tx])
    }
  }

  // Function to handle the interval call
  async function checkBitcoinData() {
    const length = await getTotalInscriptions()
    setTotalInscription(length)
  }

  useEffect(() => {
    const intervalId = setInterval(checkBitcoinData, 5000)
  }, [])

  useEffect(() => {
    if ((!isLoaded && newBlock) || (!isLoaded && status)) {
      setIsLoaded(true)
    }
  }, [isLoaded, newBlock, status])

  console.log({ txs })

  if (txs.length) {
    debugger
  }

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
                  value={'#100000'}
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>

              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="TOTAL INSCRIPTIONS"
                  value={'#' + totalInscription}
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
                  tooltipText=""
                />
              </Skeleton>
              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="MAX TPS"
                  value={'#1849'}
                  tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
                />
              </Skeleton>
            </SimpleGrid>
          </Box>
          <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={10}>
            <GridItem colSpan={7}>
              <TransactionList title="Transactions" showAll={false} txs={txs} />
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
