import { useColorModeValue, Flex, Spinner } from '@chakra-ui/react'
import Head from 'next/head'

export default function LoadingPage() {
  return (
    <>
      <Head>
        <title>Dexplorer</title>
        <meta name="description" content="Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        w="100"
        bg={useColorModeValue('gray.100', 'gray.900')}
      >
        <Spinner size="xl" />
      </Flex>
    </>
  )
}
