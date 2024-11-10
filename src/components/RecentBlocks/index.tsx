import {
  Box,
  Button,
  HStack,
  Image,
  Link,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'

import { getTotalInscriptions } from '@/rpc/query'
import startBlockMonitor, { BlockHeader } from '@/rpc/subscribeRecentBlocks'
import { shortenAddress } from '@/utils/helper'
import { images } from '@/utils/images'

export default function RecentBlocks() {
  const [blockHeaders, setBlockHeaders] = useState<BlockHeader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inscriptionData, setInscriptionData] = useState([])

  async function checkBitcoinData() {
    const data = await getTotalInscriptions()
    const bitcoinData = data?.bitcoindata
    setInscriptionData(bitcoinData.reverse().slice(0, -1)) // removing one element that has wrong values for now in the chain FIX THIS LATER
  }

  useEffect(() => {
    const intervalId = setInterval(checkBitcoinData, 15000)
    // checkBitcoinData();
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const onData = (data: any) => {
      setBlockHeaders((prevHeaders) => [data, ...prevHeaders].slice(0, 3))
      setIsLoading(false)
    }
    const cleanup = startBlockMonitor(undefined, onData)

    return cleanup
  }, [])
  console.log(blockHeaders, 'blockHeaders')
  return (
    <Box>
      <HStack justifyContent={'space-between'} mb={3}>
        <Text fontSize={'2xl'} color={'gray-50'}>
          Recent Blocks
        </Text>
        <Text fontSize={'xs'} color={'gray-400'} pr={2} fontWeight={500}>
          Auto Updates
        </Text>
      </HStack>
      <VStack gap={4} w={'100%'} mb={'38px'}>
        <Skeleton w={'100%'} isLoaded={!isLoading}>
          {inscriptionData.map((item: any) => (
            <div key={item.revealTx || item.startBlock}>
              {item?.revealTx ? <RecentBlock bitcoinData={item} /> : <></>}
            </div>
          ))}
        </Skeleton>
      </VStack>
      {!isLoading && (
        <Box width={'full'}>
          <Button
            border={'1px'}
            borderColor={'primary-500'}
            width={'100%'}
            alignSelf={'center'}
            bg={'dark-bg'}
            color={'primary-500'}
            borderRadius={'12px'}
            _hover={{
              bg: '#010101',
            }}
          >
            See All Blocks
          </Button>
        </Box>
      )}
    </Box>
  )
}

const RecentBlock = ({ bitcoinData }: any) => {
  const dummyData: any = [
    {
      blockId: bitcoinData.startBlock,
      address: '',
      // transactions: '1txn',
      // timeAgo: '2hr ago',
    },
    {
      blockId: bitcoinData.endBlock,
      address: '',
      // transactions: '1txn',
      // timeAgo: '2hr ago',
    },
    // {
    //   blockId: '291204',
    //   address:
    //     '0x00000000000000000002e4add93ab2a51d8d405d60177fd30f791027deefb001',
    //   transactions: '2txn',
    //   timeAgo: '3hr ago',
    // },
    // {
    //   blockId: 'Test',
    //   address:
    //     '0x00000000000000000002e4add93ab2a51d8d405d60177fd30f791027deefb001',
    //   transactions: '2txn',
    //   timeAgo: '3hr ago',
    // },
  ]
  return (
    <Box bg={'gray-1100'} borderRadius={12} w={'100%'} marginBottom={4}>
      <Box px={4} py={5} bg="gray-1200" borderTopRadius={12}>
        <HStack justifyContent="space-between">
          <HStack gap={3}>
            <Image src={images.chainLink.src} alt="chain" />
            <HStack gap={1}>
              <Image width={5} src={images.bitcoinLogo.src} alt="bitcoin" />
              <Link
                as={NextLink}
                target="_blank"
                href={`https://signet.surge.dev/tx/${bitcoinData.revealTx}`}
                _focus={{ boxShadow: 'none' }}
                display={'block'}
                fontSize={'14px'}
                color={'yellow-100'}
              >
                {shortenAddress(bitcoinData?.revealTx) ?? ''}
              </Link>
            </HStack>
          </HStack>
          <HStack gap={1}>
            <Link
              as={NextLink}
              href={'/blocks'}
              _focus={{ boxShadow: 'none' }}
              fontSize={'xs'}
              color={'gray-500'}
              textDecoration={'underline'}
            >
              {/* {shortenAddress(
                '0x00000000000000000001e4add93ab2a51d8d405d60177fd30f791027deefaffd'
              )} */}
            </Link>
            <Dot />
            <Text fontSize={'xs'} color={'gray-400'}>
              {/* 2hr ago */}
            </Text>
          </HStack>
        </HStack>
      </Box>
      <Box px={4} py={'14px'}>
        <Box position="relative">
          <Box
            position="absolute"
            left="20px"
            top="42px"
            bottom="0"
            width="1px"
            bg="primary-900"
            zIndex="1"
            height={'68%'}
          />
          {dummyData.slice(0, -1).map((data: any, index: number) => (
            <HStack
              key={index}
              justifyContent="space-between"
              py="14px"
              borderBottom="1px"
              borderColor="gray-900"
              ml={10}
              position="relative"
              _last={{ borderBottom: 'none' }}
            >
              {index === 0 && (
                <Image
                  src={images.logoShort.src}
                  alt="Surge"
                  position="absolute"
                  left="-30px"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                />
              )}
              <Box
                className="dots"
                position="absolute"
                left="-22.5px"
                top="50%"
                transform="translateY(-50%)"
                width="6px"
                height="6px"
                borderRadius="full"
                bg="primary-500"
                zIndex="2"
              />

              <HStack gap={3}>
                <HStack gap={1}>
                  <Image width={5} src={images.block.src} alt="block" />
                  <Link
                    as={NextLink}
                    href={`/blocks/${data.blockId}`}
                    _focus={{ boxShadow: 'none' }}
                    display="block"
                    fontSize="14px"
                    color="primary-200"
                  >
                    {data.blockId}
                  </Link>
                </HStack>
              </HStack>
              <HStack gap={1}>
                <Link
                  as={NextLink}
                  href={`/address/${data.address}`}
                  _focus={{ boxShadow: 'none' }}
                  fontSize="xs"
                  color="gray-500"
                  textDecoration="underline"
                >
                  {shortenAddress(data.address)}
                </Link>
                <Box w="2px" h="2px" bg="gray-500" borderRadius={99} />
                <Text fontSize="xs" color="gray-500">
                  {data?.transactions ?? ''}
                </Text>
                <Box w="2px" h="2px" bg="gray-500" borderRadius={99} />
                <Text fontSize="xs" color="gray-400">
                  {data?.timeAgo || ''}
                </Text>
              </HStack>
            </HStack>
          ))}
        </Box>
        <Box
          px={3}
          py={'10px'}
          bg={'gray-1000'}
          display={'inline-block'}
          mt={2}
          borderRadius={99}
        >
          <Text fontSize={'xs'} color={'text-200'} fontWeight={500}>
            +9 Blocks
          </Text>
        </Box>
        <Box position={'relative'}>
          <Box
            position="absolute"
            left="20px"
            top="4px"
            width="1px"
            bg="primary-900"
            zIndex="1"
            height={'24px'}
          />
          {dummyData.slice(-1).map((data: any, index: number) => (
            <HStack
              key={index}
              justifyContent="space-between"
              py="14px"
              ml={10}
              mt={2}
              position="relative"
            >
              <Box
                className="dots"
                position="absolute"
                left="-22.5px"
                top="50%"
                transform="translateY(-50%)"
                width="6px"
                height="6px"
                borderRadius="full"
                bg="primary-500"
                zIndex="2"
              />

              <HStack gap={3}>
                <HStack gap={1}>
                  <Image width={5} src={images.block.src} alt="block" />
                  <Link
                    as={NextLink}
                    href={`/blocks/${data.blockId}`}
                    _focus={{ boxShadow: 'none' }}
                    display="block"
                    fontSize="14px"
                    color="primary-200"
                  >
                    {data.blockId}
                  </Link>
                </HStack>
              </HStack>
              <HStack gap={1}>
                <Link
                  as={NextLink}
                  href={`/address/${data.address}`}
                  _focus={{ boxShadow: 'none' }}
                  fontSize="xs"
                  color="gray-500"
                  textDecoration="underline"
                >
                  {shortenAddress(data.address)}
                </Link>
                <Dot />
                <Text fontSize="xs" color="gray-500">
                  {data.transactions}
                </Text>
                <Dot />
                <Text fontSize="xs" color="gray-400">
                  {data.timeAgo}
                </Text>
              </HStack>
            </HStack>
          ))}
        </Box>
      </Box>
      {/* <Box px={4} py={5} bg="gray-1200" borderBottomRadius={12}>
        <HStack gap={2}>
          <Image w={4} src={images.stars.src} alt="" />
          <HStack>
            <Text fontSize={'xs'} color={'gray-500'}>
              120 txns
            </Text>
            <Box w={'2px'} h={'2px'} bg={'gray-500'} borderRadius={99} />
            <Text fontSize={'xs'} color={'gray-500'}>
              12 blocks
            </Text>
            <Box w={'2px'} h={'2px'} bg={'gray-500'} borderRadius={99} />
            <Text fontSize={'xs'} color={'gray-500'}>
              ~6s settlement
            </Text>
          </HStack>
        </HStack>
      </Box> */}
    </Box>
  )
}
const Dot = () => {
  return <Box w="2px" h="2px" bg="gray-500" borderRadius={99} />
}
