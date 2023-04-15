import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAccount, getAllBalances, getBalanceStaked } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Account, Coin } from '@cosmjs/stargate'

export default function DetailAccount() {
  const router = useRouter()
  const toast = useToast()
  const { address } = router.query
  const tmClient = useSelector(selectTmClient)
  const [account, setAccount] = useState<Account | null>(null)
  const [allBalances, setAllBalances] = useState<readonly Coin[]>([])
  const [balanceStaked, setBalanceStaked] = useState<Coin | null>(null)

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
    }
  }, [tmClient, account, allBalances, balanceStaked])

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
        <title>Detail Account | Dexplorer</title>
        <meta name="description" content="Account | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Block</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Icon fontSize="16" color={'cyan.400'} as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Accounts</Text>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Detail</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.900')}
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
          bg={useColorModeValue('white', 'gray.900')}
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
      </main>
    </>
  )
}
