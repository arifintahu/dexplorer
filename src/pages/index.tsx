import '@/styles/Home.module.css'

import {
  Box,
  FlexProps,
  Grid,
  GridItem,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Skeleton,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { FiBox, FiClock, FiCpu, FiUsers } from 'react-icons/fi'
import { useSelector } from 'react-redux'

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
          <Text fontSize="40px" lineHeight="52px" fontWeight="bold">
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
                />
              </Skeleton>

              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  name="Latest Block Height"
                  value={
                    newBlock?.header.height
                      ? newBlock?.header.height
                      : status?.syncInfo.latestBlockHeight
                  }
                />
              </Skeleton>
            </SimpleGrid>
          </Box>
          <Grid templateColumns="repeat(12, 1fr)" gap={5}>
            <GridItem colSpan={7} h="10" bg="tomato">
              Test
            </GridItem>
            <GridItem colSpan={5} h="10" bg="papayawhip">
              Test2
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
}
const BoxInfo = ({ name, value }: BoxInfoProps) => {
  return (
    <VStack
      bg={'gray-1000'}
      borderRadius={12}
      p={4}
      height="100px"
      align={'flex-start'}
    >
      <Heading size={'xs'} color={'text-gray-500'} mb={'14px'} fontWeight={500}>
        {name}
      </Heading>
      <Text size={'sm'}>{value}</Text>
    </VStack>
  )
}
