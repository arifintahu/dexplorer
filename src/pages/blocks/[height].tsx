import {
  Box,
  Divider,
  Heading,
  HStack,
  Icon,
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

import { getBlock } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { displayDate, getTypeMsg, timeFromNow, trimHash } from '@/utils/helper'

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

  return (
    <>
      <Head>
        <title>Detail Block | Surge Explorer</title>
        <meta name="description" content="Block | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="block_main">
        <HStack h="24px">
          <Heading size={'md'} color={'text-50'}>
            Block
          </Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon
              fontSize="16"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon color={'text-50'} fontSize="16" as={FiChevronRight} />
          <Link
            as={NextLink}
            href={'/blocks'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text color={'text-50'}>Blocks</Text>
          </Link>
          <Icon color={'text-50'} fontSize="16" as={FiChevronRight} />
          <Text color={'text-50'}>Block #{height}</Text>
        </HStack>
        <Box
          mt={8}
          bg={'dark-bg'}
          border={'1px'}
          borderColor={'gray-900'}
          borderRadius={4}
        >
          <Heading size={'md'} p={4} color={'text-50'}>
            Header
          </Heading>
          <Divider borderColor={'gray-900'} />
          <TableContainer p={4}>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={150} color={'text-50'}>
                    <b>Chain Id</b>
                  </Td>
                  <Td color={'text-500'}>{block?.header.chainId}</Td>
                </Tr>
                <Tr>
                  <Td color={'text-50'} pl={0} width={150}>
                    <b>Height</b>
                  </Td>
                  <Td color={'text-500'}>{block?.header.height}</Td>
                </Tr>
                <Tr>
                  <Td color={'text-50'} pl={0} width={150}>
                    <b>Block Time</b>
                  </Td>
                  <Td color={'text-500'}>
                    {block?.header.time
                      ? `${timeFromNow(block?.header.time)} ( ${displayDate(
                          block?.header.time
                        )} )`
                      : ''}
                  </Td>
                </Tr>
                <Tr>
                  <Td color={'text-50'} pl={0} width={150}>
                    <b>Block Hash</b>
                  </Td>
                  <Td color={'text-500'}> {block?.id}</Td>
                </Tr>
                <Tr>
                  <Td color={'text-50'} pl={0} width={150}>
                    <b>Number of Tx</b>
                  </Td>
                  <Td color={'text-500'}>{block?.txs.length}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          mt={8}
          bg={'dark-bg'}
          borderRadius={4}
          border={'1px'}
          borderColor={'gray-900'}
        >
          <Heading size={'md'} p={4} color={'text-50'}>
            Transactions
          </Heading>
          <Divider borderColor={'gray-900'} mb={4} />
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color={'text-500'}>Tx Hash</Th>
                  <Th color={'text-500'}>Messages</Th>
                  <Th color={'text-500'}>Fee</Th>
                  <Th color={'text-500'}>Height</Th>
                  <Th color={'text-500'}>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {txs.length > 0 ? (
                  txs.map((tx) => (
                    <Tr key={toHex(tx.hash)}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={'/txs/' + toHex(tx.hash).toUpperCase()}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text color={'cyan.400'}>{trimHash(tx.hash)}</Text>
                        </Link>
                      </Td>
                      <Td>{renderMessages(tx.data.body?.messages)}</Td>
                      <Td>{getFee(tx.data.authInfo?.fee?.amount)}</Td>
                      <Td>{height}</Td>
                      <Td>
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
      </main>
    </>
  )
}
