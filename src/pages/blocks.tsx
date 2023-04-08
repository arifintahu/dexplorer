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
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { toHex } from '@cosmjs/encoding'

const MAX_BLOCKS = 20

export default function Blocks() {
  const newBlock = useSelector(selectNewBlock)
  const [events, setEvents] = useState<NewBlockEvent[]>([])

  useEffect(() => {
    if (newBlock) {
      updateEvent(newBlock)
    }
  }, [newBlock])

  const updateEvent = (event: NewBlockEvent) => {
    if (events.length) {
      if (event.header.height > events[0].header.height) {
        setEvents((prevEvents) => [
          event,
          ...prevEvents.slice(0, MAX_BLOCKS - 1),
        ])
      }
    } else {
      setEvents([event])
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
                {events.map((event) => (
                  <Tr key={event.header.height}>
                    <Td>{event.header.height}</Td>
                    <Td noOfLines={1}>{toHex(event.header.appHash)}</Td>
                    <Td>{event.txs.length}</Td>
                    <Td>{timeFromNow(event.header.time.toISOString())}</Td>
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
