import {
  Box,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Img,
  Link,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { sha256 } from '@cosmjs/crypto'
import { toHex } from '@cosmjs/encoding'
import { Block, Coin } from '@cosmjs/stargate'
import { Tx as TxData } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { useSelector } from 'react-redux'

import CopyIcon from '@/components/shared/CopyIcon'
import GradientBackground from '@/components/shared/GradientBackground'
import TransactionList from '@/components/TransactionList'
import { getBlock } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { truncate } from '@/utils'
import { displayDate, getTypeMsg, timeFromNow, trimHash } from '@/utils/helper'
import { images } from '@/utils/images'

export default function DetailBlock() {
  const router = useRouter()
  const toast = useToast()
  const { height } = router.query
  const tmClient = useSelector(selectTmClient)
  const [block, setBlock] = useState<Block | null>(null)

  interface Tx {
    data: TxData
    hash: Uint8Array
  }
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (tmClient && height) {
      getBlock(tmClient, parseInt(height as string, 10))
        .then(setBlock)
        .catch(showError)
    }
  }, [tmClient, height])

  useEffect(() => {
    if (block?.txs.length && !txs.length) {
      for (const rawTx of block.txs) {
        const data = TxData.decode(rawTx)
        console.log(data, 'Tx data')
        const hash = sha256(rawTx)
        setTxs((prevTxs) => [
          ...prevTxs,
          {
            data,
            hash,
          },
        ])
      }
    }
  }, [block])

  const renderMessages = (messages: any) => {
    if (messages.length == 1) {
      return (
        <HStack>
          <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
        </HStack>
      )
    } else if (messages.length > 1) {
      return (
        <HStack>
          <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
          <Text textColor="cyan.800">+{messages.length - 1}</Text>
        </HStack>
      )
    }

    return ''
  }

  const getFee = (fees: Coin[] | undefined) => {
    if (fees && fees.length) {
      return (
        <HStack>
          <Text>{fees[0].amount}</Text>
          <Text textColor="cyan.800">{fees[0].denom}</Text>
        </HStack>
      )
    }
    return ''
  }

  const showError = (err: Error) => {
    const errMsg = err.message
    let error = null
    try {
      error = JSON.parse(errMsg)
    } catch (e) {
      error = {
        message: 'Invalid',
        data: errMsg,
      }
    }

    toast({
      title: error.message,
      description: error.data,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  console.log(block, 'block data')
  console.log(txs, 'block txs')

  return (
    <>
      <Head>
        <title>Detail Block | Surge Explorer</title>
        <meta name="description" content="Block | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <GradientBackground title={`Block #${block?.header.height}`}>
          <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={10}>
            <GridItem colSpan={{ base: 12, md: 7 }}>
              <Box
                mt={8}
                bg={'#2A313A66'}
                shadow={'base'}
                borderRadius={'xl'}
                p={4}
                position={'relative'}
              >
                <Text
                  size={'md'}
                  mb={4}
                  className="body2_medium"
                  color={'text-500'}
                >
                  OVERVIEW
                </Text>
                <VStack w={'100%'} justifyContent={'start'} gap={6}>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'20%'}
                    >
                      Hash
                    </Text>

                    <HStack gap={2}>
                      <Text className="body2_regular">{`${truncate(
                        block?.id ?? '',
                        12
                      )}`}</Text>
                      <CopyIcon
                        text={block?.id ?? ''}
                        icon={images.copyIcon.src}
                      />
                    </HStack>
                  </HStack>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'20%'}
                    >
                      Height
                    </Text>
                    <Text className="body2_regular">{`# ${block?.header.height}`}</Text>
                  </HStack>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'20%'}
                    >
                      Mined
                    </Text>
                    <Text className="body2_regular">
                      {block?.header.time
                        ? `${timeFromNow(block?.header.time)} ( ${displayDate(
                            block?.header.time
                          )} )`
                        : ''}
                    </Text>
                  </HStack>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'20%'}
                    >
                      Transactions
                    </Text>
                    <Text className="body2_regular">{block?.txs.length}</Text>
                  </HStack>
                </VStack>
                <Img
                  src={images.cubeOutline.src}
                  w={200}
                  height={200}
                  position={'absolute'}
                  right={0}
                  bottom={0}
                />
              </Box>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 5 }}>
              <Box
                mt={8}
                bg={'#2A313A66'}
                shadow={'base'}
                borderRadius={'xl'}
                p={4}
                position={'relative'}
              >
                <Text
                  size={'md'}
                  mb={4}
                  className="body2_medium"
                  color={'text-500'}
                >
                  BITCOIN ANCHOR
                </Text>
                <VStack w={'100%'} gap={6}>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'40%'}
                    >
                      Block Height
                    </Text>

                    <Text w={'full'}>{`#${block?.header.height}`}</Text>
                  </HStack>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'40%'}
                    >
                      Block Hash
                    </Text>
                    <HStack gap={2} w={'full'}>
                      <Text className="body2_regular" color={'text-50'}>
                        {truncate(block?.id ?? '')}
                      </Text>
                      <CopyIcon
                        text={block?.id ?? ''}
                        icon={images.copyIcon.src}
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
          </Grid>

          <Box
            mt={8}
            bg={'dark-bg'}
            borderRadius={'xl'}
            border={'1px'}
            borderColor={'gray-900'}
          >
            <Text className="body1_medium" p={4} color={'text-50'}>
              Transactions
            </Text>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th borderColor={'gray-900'} color={'text-500'}>
                      Tx Hash
                    </Th>
                    <Th borderColor={'gray-900'} color={'text-500'}>
                      Messages
                    </Th>
                    <Th borderColor={'gray-900'} color={'text-500'}>
                      Fee
                    </Th>
                    <Th borderColor={'gray-900'} color={'text-500'}>
                      Height
                    </Th>
                    <Th borderColor={'gray-900'} color={'text-500'}>
                      Time
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {txs.length > 0 ? (
                    txs.map((tx) => (
                      <Tr
                        key={toHex(tx.hash)}
                        border={'1px'}
                        borderColor={'gray-900'}
                        _last={{ border: 'none' }}
                      >
                        <Td border={'none'}>
                          <Link
                            as={NextLink}
                            href={'/txs/' + toHex(tx.hash).toUpperCase()}
                            style={{ textDecoration: 'none' }}
                            _focus={{ boxShadow: 'none' }}
                          >
                            <Text className="body2_regular">
                              {trimHash(tx.hash)}
                            </Text>
                          </Link>
                        </Td>
                        <Td border={'none'} className="body2_regular">
                          {renderMessages(tx.data.body?.messages)}
                        </Td>
                        <Td border={'none'} className="body2_regular">
                          {getFee(tx.data.authInfo?.fee?.amount)}
                        </Td>
                        <Td border={'none'} className="body2_regular">
                          {height}
                        </Td>
                        <Td border={'none'} className="body2_regular">
                          {block?.header.time
                            ? timeFromNow(block?.header.time)
                            : ''}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td border={'none'} colSpan={5} textAlign="center" py={8}>
                        <Text color={'text-50'}>
                          No transactions available!!!
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GradientBackground>
      </Box>
    </>
  )
}
