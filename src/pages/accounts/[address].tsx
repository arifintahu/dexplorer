import {
  Box,
  Divider,
  Heading,
  HStack,
  Icon,
  Link,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import { toHex } from '@cosmjs/encoding'
import { Account, Coin } from '@cosmjs/stargate'
import { TxSearchResponse } from '@cosmjs/tendermint-rpc'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { useSelector } from 'react-redux'

import {
  getAccount,
  getAllBalances,
  getBalanceStaked,
  getTxsBySender,
} from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { getTypeMsg, trimHash } from '@/utils/helper'

export default function DetailAccount() {
  const router = useRouter()
  const toast = useToast()
  const { address } = router.query
  const tmClient = useSelector(selectTmClient)
  const [account, setAccount] = useState<Account | null>(null)
  const [allBalances, setAllBalances] = useState<readonly Coin[]>([])
  const [balanceStaked, setBalanceStaked] = useState<Coin | null>(null)
  const [txSearch, setTxSearch] = useState<TxSearchResponse | null>(null)

  interface Tx {
    data: TxBody
    height: number
    hash: Uint8Array
  }
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (tmClient && address) {
      if (!account) {
        getAccount(tmClient, address as string)
          .then(setAccount)
          .catch(showError)
      }

      if (!allBalances.length) {
        getAllBalances(tmClient, address as string)
          .then(setAllBalances)
          .catch(showError)
      }

      if (!balanceStaked) {
        getBalanceStaked(tmClient, address as string)
          .then(setBalanceStaked)
          .catch(showError)
      }

      getTxsBySender(tmClient, address as string, 1, 30)
        .then(setTxSearch)
        .catch(showError)
    }
  }, [tmClient, account, allBalances, balanceStaked])

  useEffect(() => {
    if (txSearch?.txs.length && !txs.length) {
      for (const rawTx of txSearch.txs) {
        if (rawTx.result.data) {
          const data = TxBody.decode(rawTx.result.data)
          setTxs((prevTxs) => [
            ...prevTxs,
            {
              data,
              hash: rawTx.hash,
              height: rawTx.height,
            },
          ])
        }
      }
    }
  }, [txSearch])

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

  return (
    <>
      <Head>
        <title>Detail Account | Surge Explorer</title>
        <meta name="description" content="Account | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Account</Heading>
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
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Accounts</Text>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Detail</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Profile
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          <TableContainer>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Address</b>
                  </Td>
                  <Td>{address}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Pub Key</b>
                  </Td>
                  <Td>
                    <Tabs>
                      <TabList>
                        <Tab>@Type</Tab>
                        <Tab>Key</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <p>{account?.pubkey?.type}</p>
                        </TabPanel>
                        <TabPanel>
                          <p>{account?.pubkey?.value}</p>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Account Number</b>
                  </Td>
                  <Td>{account?.accountNumber}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Sequence</b>
                  </Td>
                  <Td>{account?.sequence}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Balances
          </Heading>
          <Heading size={'sm'} mb={4}></Heading>
          <Tabs size="md">
            <TabList>
              <Tab>Available</Tab>
              <Tab>Delegated</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Denom</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allBalances.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.denom}</Td>
                          <Td>{item.amount}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Denom</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{balanceStaked?.denom}</Td>
                        <Td>{balanceStaked?.amount}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Transactions
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Messages</Th>
                  <Th>Memo</Th>
                  <Th>Height</Th>
                </Tr>
              </Thead>
              <Tbody>
                {txs.map((tx) => (
                  <Tr key={toHex(tx.hash)}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/txs/' + toHex(tx.hash).toUpperCase()}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text
                          color={useColorModeValue('light-theme', 'dark-theme')}
                        >
                          {trimHash(tx.hash)}
                        </Text>
                      </Link>
                    </Td>
                    <Td>{renderMessages(tx.data.messages)}</Td>
                    <Td>{tx.data.memo}</Td>
                    <Td>
                      <Link
                        as={NextLink}
                        href={'/blocks/' + tx.height}
                        style={{ textDecoration: 'none' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <Text
                          color={useColorModeValue('light-theme', 'dark-theme')}
                        >
                          {tx.height}
                        </Text>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </>
  )
}
