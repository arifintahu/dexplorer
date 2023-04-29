import { FormEvent, ChangeEvent, useState } from 'react'
import {
  Stack,
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Heading,
  Text,
  Container,
  Flex,
  Box,
  IconButton,
} from '@chakra-ui/react'
import { AddIcon, CheckIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import Head from 'next/head'
import { LS_RPC_ADDRESS } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'

const chainList = [
  {
    name: 'Cosmos Hub',
    rpc: 'https://cosmoshub-rpc.lavenderfive.com',
  },
  {
    name: 'Osmosis',
    rpc: 'https://rpc-osmosis.ecostake.com',
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
    await connectClient(address)
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
    } catch (err) {
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
        <title>Dexplorer | Connect</title>
        <meta name="description" content="Dexplorer | Connect to RPC Address" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.100', 'gray.900')}
        flexDirection={'column'}
        gap={16}
      >
        <Container
          maxW={'lg'}
          bg={useColorModeValue('white', 'whiteAlpha.100')}
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
            Dexplorer
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
                colorScheme={state === 'success' ? 'green' : 'blue'}
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
            {error
              ? 'Oh no, cannot connect to client! 😢 Please try another RPC address.'
              : ''}
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
                bg={'white'}
                boxShadow={'lg'}
                rounded={'sm'}
                px={6}
                py={4}
                justifyContent="space-between"
                alignItems="center"
                key={chain.name}
                mb={4}
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
                  variant="outline"
                  colorScheme="blue"
                  aria-label="Add RPC"
                  fontSize="20px"
                  icon={<AddIcon />}
                />
              </Flex>
            )
          })}
        </Container>
      </Flex>
    </>
  )
}
