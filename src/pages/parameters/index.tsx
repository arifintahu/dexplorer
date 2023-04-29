import { Divider, HStack, Heading, Icon, Link, Text } from '@chakra-ui/react'
import Head from 'next/head'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import MintParameters from '@/components/Parameters/MintParameters'
import StakingParameters from '@/components/Parameters/StakingParameters'

export default function Parameters() {
  return (
    <>
      <Head>
        <title>Parameters | Dexplorer</title>
        <meta name="description" content="Parameters | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Parameters</Heading>
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
          <Text>Parameters</Text>
        </HStack>
        <MintParameters />
        <StakingParameters />
      </main>
    </>
  )
}
