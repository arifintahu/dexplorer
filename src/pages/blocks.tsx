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
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'

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
    setEvents((prevEvents) => [event, ...prevEvents.slice(0, MAX_BLOCKS - 1)])
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
        <Box mt={8}>{events.length}</Box>
      </main>
    </>
  )
}
