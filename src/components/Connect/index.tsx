import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  IconButton,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Head from 'next/head'
import { ChangeEvent, FormEvent, useState } from 'react'
import { FiZap } from 'react-icons/fi'
import { useDispatch } from 'react-redux'

import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import {
  setConnectState,
  setRPCAddress,
  setTmClient,
} from '@/store/connectSlice'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'

const chainList = [
  {
    name: 'Surge',
    rpc: 'https://devnet.surge.dev/rpc',
  },
]

export default function Connect() {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )

  const [error, setError] = useState(false)
  const dispatch = useDispatch()

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const addr = removeTrailingSlash(address)

    await connectClient(addr)
  }

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      const tmClient = await connectWebsocketClient(rpcAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))
      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.localStorage.setItem(
        LS_RPC_ADDRESS_LIST,
        JSON.stringify([rpcAddress])
      )
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const selectChain = (rpcAddress: string) => {
    setAddress(rpcAddress)
    connectClient(rpcAddress)
  }

  return (
    <>
      <Head>
        <title>Surge Explorer | Connect</title>
        <meta
          name="description"
          content="Surge Explorer | Connect to RPC Address"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('light-bg', 'dark-bg')}
        flexDirection={'column'}
        gap={16}
      >
        <Container
          maxW={'lg'}
          bg={useColorModeValue('light-container', 'dark-container')}
          boxShadow={'xl'}
          rounded={'lg'}
          p={6}
        >
          <Heading
            as={'h2'}
            fontSize={{ base: '2xl', sm: '3xl' }}
            textAlign={'center'}
            fontFamily="monospace"
            fontWeight="bold"
          >
            Surge Explorer
          </Heading>
          <Text as={'h2'} fontSize="lg" textAlign={'center'} mb={5}>
            Disposable Cosmos SDK Chain Explorer
          </Text>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            as={'form'}
            spacing={'12px'}
            onSubmit={submitForm}
          >
            <FormControl>
              <Input
                variant={'solid'}
                borderWidth={1}
                color={'gray.800'}
                _placeholder={{
                  color: 'gray.400',
                }}
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                id={'address'}
                type={'url'}
                required
                placeholder={'RPC Address'}
                aria-label={'RPC Address'}
                value={address}
                disabled={state !== 'initial'}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
              />
            </FormControl>
            <FormControl w={{ base: '100%', md: '40%' }}>
              <Button
                backgroundColor={useColorModeValue('light-theme', 'dark-theme')}
                color={'white'}
                _hover={{
                  backgroundColor: useColorModeValue(
                    'dark-theme',
                    'light-theme'
                  ),
                }}
                isLoading={state === 'submitting'}
                w="100%"
                type={state === 'success' ? 'button' : 'submit'}
              >
                {state === 'success' ? <CheckIcon /> : 'Connect'}
              </Button>
            </FormControl>
          </Stack>
          <Text
            mt={2}
            textAlign={'center'}
            color={error ? 'red.500' : 'gray.500'}
          >
            {error ? 'Oh no, cannot connect to websocket client! 😢' : ''}
          </Text>
        </Container>
        <Container p={0}>
          <Heading
            as={'h2'}
            fontSize="xl"
            textAlign={'center'}
            fontFamily="monospace"
            mb={6}
          >
            Try out these RPCs
          </Heading>
          {chainList.map((chain) => {
            return (
              <Flex
                maxW={'lg'}
                bg={useColorModeValue('light-container', 'dark-container')}
                boxShadow={'lg'}
                rounded={'sm'}
                px={6}
                py={4}
                justifyContent="space-between"
                alignItems="center"
                key={chain.name}
                mb={4}
                mx={'auto'}
              >
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    {chain.name}
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {chain.rpc}
                  </Text>
                </Box>
                <IconButton
                  onClick={() => selectChain(chain.rpc)}
                  backgroundColor={useColorModeValue(
                    'light-theme',
                    'dark-theme'
                  )}
                  color={'white'}
                  _hover={{
                    backgroundColor: useColorModeValue(
                      'dark-theme',
                      'light-theme'
                    ),
                  }}
                  aria-label="Connect RPC"
                  size="sm"
                  fontSize="20"
                  icon={<FiZap />}
                />
              </Flex>
            )
          })}
        </Container>
      </Flex>
    </>
  )
}
