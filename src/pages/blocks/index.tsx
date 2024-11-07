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
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'
import { toHex } from '@cosmjs/encoding'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Head from 'next/head'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { FiCheck, FiChevronRight, FiHome, FiX } from 'react-icons/fi'
import { useSelector } from 'react-redux'

import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'
import { getTypeMsg, timeFromNow, trimHash } from '@/utils/helper'

const MAX_ROWS = 20

interface Tx {
  TxEvent: TxEvent
  Timestamp: Date
}

export default function Blocks() {
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const [blocks, setBlocks] = useState<NewBlockEvent[]>([])

  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    if (newBlock) {
      updateBlocks(newBlock)
    }
  }, [newBlock])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  const updateBlocks = (block: NewBlockEvent) => {
    if (blocks.length) {
      if (block.header.height > blocks[0].header.height) {
        setBlocks((prevBlocks) => [block, ...prevBlocks.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setBlocks([block])
    }
  }

  const updateTxs = (txEvent: TxEvent) => {
    const tx = {
      TxEvent: txEvent,
      Timestamp: new Date(),
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

  const renderMessages = (data: Uint8Array | undefined) => {
    if (data) {
      const txBody = TxBody.decode(data)
      const messages = txBody.messages

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
    }

    return ''
  }

  return (
    <>
      <Head>
        <title>Blocks | Surge Explorer</title>
        <meta name="description" content="Blocks | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Blocks</Heading>
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
          <Text>Blocks</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Tabs variant="unstyled">
            <TabList>
              <Tab
                _selected={{ color: 'white', bg: 'cyan.400' }}
                borderRadius={5}
              >
                Blocks
              </Tab>
              <Tab
                _selected={{ color: 'white', bg: 'cyan.400' }}
                borderRadius={5}
              >
                Transactions
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Height</Th>
                        <Th>App Hash</Th>
                        <Th>Txs</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {blocks.map((block) => (
                        <Tr key={block.header.height}>
                          <Td>
                            <Link
                              as={NextLink}
                              href={'/blocks/' + block.header.height}
                              style={{ textDecoration: 'none' }}
                              _focus={{ boxShadow: 'none' }}
                            >
                              <Text color={'cyan.400'}>
                                {block.header.height}
                              </Text>
                            </Link>
                          </Td>
                          <Td noOfLines={1}>{toHex(block.header.appHash)}</Td>
                          <Td>{block.txs.length}</Td>
                          <Td>
                            {timeFromNow(block.header.time.toISOString())}
                          </Td>
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
                        <Th>Tx Hash</Th>
                        <Th>Result</Th>
                        <Th>Messages</Th>
                        <Th>Height</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {txs.map((tx) => (
                        <Tr key={toHex(tx.TxEvent.hash)}>
                          <Td>
                            <Link
                              as={NextLink}
                              href={
                                '/txs/' + toHex(tx.TxEvent.hash).toUpperCase()
                              }
                              style={{ textDecoration: 'none' }}
                              _focus={{ boxShadow: 'none' }}
                            >
                              <Text color={'cyan.400'}>
                                {trimHash(tx.TxEvent.hash)}
                              </Text>
                            </Link>
                          </Td>
                          <Td>
                            {tx.TxEvent.result.code == 0 ? (
                              <Tag variant="subtle" colorScheme="green">
                                <TagLeftIcon as={FiCheck} />
                                <TagLabel>Success</TagLabel>
                              </Tag>
                            ) : (
                              <Tag variant="subtle" colorScheme="red">
                                <TagLeftIcon as={FiX} />
                                <TagLabel>Error</TagLabel>
                              </Tag>
                            )}
                          </Td>
                          <Td>{renderMessages(tx.TxEvent.result.data)}</Td>
                          <Td>{tx.TxEvent.height}</Td>
                          <Td>{timeFromNow(tx.Timestamp.toISOString())}</Td>
                        </Tr>
                      ))}
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
