import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { NewBlockEvent } from '@cosmjs/tendermint-rpc'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  useColorModeValue,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { toHex, toBase64 } from '@cosmjs/encoding'

const MAX_BLOCKS = 20

export default function Blocks() {
  const newBlock = useSelector(selectNewBlock)
  const [blocks, setBlocks] = useState<NewBlockEvent[]>([])

  useEffect(() => {
    if (newBlock) {
      updateEvent(newBlock)
    }
  }, [newBlock])

  const updateEvent = (event: NewBlockEvent) => {
    if (blocks.length) {
      if (event.header.height > blocks[0].header.height) {
        setBlocks((prevBlocks) => [
          event,
          ...prevBlocks.slice(0, MAX_BLOCKS - 1),
        ])
      }
    } else {
      setBlocks([event])
    }
  }

  const timeFromNow = (date: string): string => {
    dayjs.extend(relativeTime)
    return dayjs(date).fromNow()
  }

  return (
    <>
      <Head>
        <title>Blocks | Dexplorer</title>
        <meta name="description" content="Home | Dexplorer" />
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
          >
            <Icon fontSize="16" color={'cyan.400'} as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Blocks</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.900')}
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
                          <Td>{block.header.height}</Td>
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
                        <Th>Hash</Th>
                        <Th>Result</Th>
                        <Th>Fee</Th>
                        <Th>Messages</Th>
                        <Th>Height</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody></Tbody>
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
