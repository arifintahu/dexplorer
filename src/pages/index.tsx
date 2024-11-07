import Head from 'next/head'
import {
  useColorModeValue,
  FlexProps,
  Heading,
  Icon,
  Text,
  SimpleGrid,
  Box,
  VStack,
  Skeleton,
  Image,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { FiBox, FiClock, FiCpu, FiUsers } from 'react-icons/fi'
import '@/styles/Home.module.css'
import { IconType } from 'react-icons'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getValidators } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { selectNewBlock } from '@/store/streamSlice'
import { displayDate } from '@/utils/helper'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
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
                  bgColor="cyan.200"
                  color="cyan.600"
                  icon={FiBox}
                  name="Latest Block Height"
                  value={
                    newBlock?.header.height
                      ? newBlock?.header.height
                      : status?.syncInfo.latestBlockHeight
                  }
                />
              </Skeleton>
              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  bgColor="green.200"
                  color="green.600"
                  icon={FiClock}
                  name="Latest Block Time"
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
                  bgColor="orange.200"
                  color="orange.600"
                  icon={FiCpu}
                  name="Network"
                  value={
                    newBlock?.header.chainId
                      ? newBlock?.header.chainId
                      : status?.nodeInfo.network
                  }
                />
              </Skeleton>

              <Skeleton isLoaded={isLoaded}>
                <BoxInfo
                  bgColor="purple.200"
                  color="purple.600"
                  icon={FiUsers}
                  name="Validators"
                  value={validators}
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
  bgColor: string
  color: string
  icon: IconType
  name: string
  value: string | number | undefined
}
const BoxInfo = ({ bgColor, color, icon, name, value }: BoxInfoProps) => {
  return (
    <VStack
      bg={useColorModeValue('light-container', 'dark-container')}
      shadow={'base'}
      borderRadius={4}
      p={4}
      height="150px"
    >
      <Box
        backgroundColor={bgColor}
        padding={2}
        height="40px"
        width="40px"
        borderRadius={'full'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        mb={2}
      >
        <Icon fontSize="20" color={color} as={icon} />
      </Box>
      <Heading size={'md'}>{value}</Heading>
      <Text size={'sm'}>{name}</Text>
    </VStack>
  )
}
