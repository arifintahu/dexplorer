import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectTmClient,
  selectRPCAddress,
  setRPCAddress,
  setTmClient,
} from '@/store/connectSlice'
import {
  Box,
  Heading,
  Text,
  HStack,
  Icon,
  IconButton,
  Input,
  Skeleton,
  useColorMode,
  Button,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Stack,
  FormControl,
} from '@chakra-ui/react'
import {
  FiRadio,
  FiSearch,
  FiRefreshCcw,
  FiWifi,
  FiWifiOff,
  FiZap,
  FiZapOff,
} from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import { CheckIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

export default function Navbar() {
  const router = useRouter()
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const toast = useToast()
  const [status, setStatus] = useState<StatusResponse | null>()

  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState(false)
  const dispatch = useDispatch()

  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenRPCs,
    onOpen: onOpenRPCs,
    onClose: onCloseRPCs,
  } = useDisclosure()

  const [inputSearch, setInputSearch] = useState('')
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)
  const [rpcList, setRPCList] = useState<string[]>([])

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
    }
  }, [tmClient])

  useEffect(() => {
    if (newBlock || status) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, status])

  const handleInputSearch = (event: any) => {
    setInputSearch(event.target.value as string)
  }

  const handleSearch = () => {
    if (!inputSearch) {
      toast({
        title: 'Please enter a value!',
        status: 'warning',
        isClosable: true,
      })
      return
    }

    if (heightRegex.test(inputSearch)) {
      router.push('/blocks/' + inputSearch)
    } else if (txhashRegex.test(inputSearch)) {
      router.push('/txs/' + inputSearch)
    } else if (addrRegex.test(inputSearch)) {
      router.push('/accounts/' + inputSearch)
    } else {
      toast({
        title: 'Invalid Height, Transaction or Account Address!',
        status: 'error',
        isClosable: true,
      })
      return
    }
    setTimeout(() => {
      onClose()
    }, 500)
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const rpcAddresses = getRPCList()
    const addr = removeTrailingSlash(newAddress)
    if (rpcAddresses.includes(addr)) {
      toast({
        title: 'This RPC Address is already in the list!',
        status: 'warning',
        isClosable: true,
      })
      return
    }
    await connectClient(addr)
    setRPCList(getRPCList())
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

      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))
      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      const rpcAddresses = JSON.parse(
        window.localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
      )
      window.localStorage.setItem(
        LS_RPC_ADDRESS_LIST,
        JSON.stringify([rpcAddress, ...rpcAddresses])
      )
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  const getRPCList = () => {
    const rpcAddresses = JSON.parse(
      window.localStorage.getItem(LS_RPC_ADDRESS_LIST) || '[]'
    )
    return rpcAddresses
  }

  const onChangeRPC = () => {
    setRPCList(getRPCList())
    setState('initial')
    setNewAddress('')
    setError(false)
    onOpenRPCs()
  }

  const selectChain = (rpcAddress: string) => {
    connectClient(rpcAddress)
  }

  const removeChain = (rpcAddress: string) => {
    const rpcList = getRPCList()
    const updatedList = rpcList.filter((rpc: string) => rpc !== rpcAddress)
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify(updatedList)
    )
    setRPCList(getRPCList())
  }

  return (
    <>
      <Box
        bg={useColorModeValue('light-container', 'dark-container')}
        w="100%"
        p={4}
        shadow={'base'}
        borderRadius={4}
        marginBottom={4}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <HStack>
          <Icon mr="4" fontSize="32" color={'green.600'} as={FiRadio} />
          <Flex
            flexDirection="row"
            gap="4"
            border="1px"
            p="2"
            borderRadius="md"
            borderColor={useColorModeValue('gray.500', 'gray.100')}
          >
            <Box>
              <Skeleton isLoaded={isLoadedSkeleton}>
                <Heading size="xs">
                  {newBlock?.header.chainId
                    ? newBlock?.header.chainId
                    : status?.nodeInfo.network}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={isLoadedSkeleton}>
                <Text fontSize="sm">{address}</Text>
              </Skeleton>
            </Box>
            <IconButton
              variant="solid"
              aria-label="Change RPC"
              size="md"
              fontSize="20"
              icon={<FiRefreshCcw />}
              onClick={onChangeRPC}
            />
          </Flex>
        </HStack>
        <HStack>
          <IconButton
            variant="ghost"
            aria-label="Search"
            size="md"
            fontSize="20"
            icon={<FiSearch />}
            onClick={onOpen}
          />
          <IconButton
            variant="ghost"
            aria-label="Color mode"
            size="md"
            fontSize="20"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
        </HStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              width={400}
              type={'text'}
              borderColor={useColorModeValue('light-theme', 'dark-theme')}
              placeholder="Height/Transaction/Account Address"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              bg={useColorModeValue('light-theme', 'dark-theme')}
              _hover={{
                opacity: 0.8,
              }}
              color="white"
              w="full"
              textTransform="uppercase"
              onClick={handleSearch}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenRPCs} onClose={onCloseRPCs}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Connection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  id={'newAddress'}
                  type={'url'}
                  required
                  placeholder={'Connect to new RPC Address'}
                  aria-label={'Connect to new RPC Address'}
                  value={newAddress}
                  disabled={state !== 'initial'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewAddress(e.target.value)
                  }
                />
              </FormControl>
              <FormControl w={{ base: '100%', md: '40%' }}>
                <Button
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
                  isLoading={state === 'submitting'}
                  w="100%"
                  type={state === 'success' ? 'button' : 'submit'}
                >
                  {state === 'success' ? <CheckIcon /> : 'Connect'}
                </Button>
              </FormControl>
            </Stack>
            <Text textAlign={'center'} color={error ? 'red.500' : 'gray.500'}>
              {error ? 'Oh no, cannot connect to websocket client! 😢' : '‎'}
            </Text>
            <Text m={2} textAlign={'center'} fontWeight="semibold">
              Available RPCs
            </Text>
            <Stack spacing={4} mb="4">
              {rpcList.map((rpc) => (
                <Flex
                  w="full"
                  border="1px"
                  borderRadius="md"
                  borderColor={useColorModeValue('gray.500', 'gray.100')}
                  p={2}
                  justifyContent="space-between"
                  alignItems="center"
                  key={rpc}
                >
                  <Box>
                    <Text fontSize="sm" wordBreak="break-all">
                      {rpc}
                    </Text>
                  </Box>
                  {rpc !== address ? (
                    <Stack direction="row">
                      <IconButton
                        onClick={() => selectChain(rpc)}
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
                      <IconButton
                        onClick={() => removeChain(rpc)}
                        backgroundColor={useColorModeValue(
                          'red.500',
                          'red.400'
                        )}
                        color={'white'}
                        _hover={{
                          backgroundColor: useColorModeValue(
                            'red.400',
                            'red.500'
                          ),
                        }}
                        aria-label="Remove RPC"
                        size="sm"
                        fontSize="20"
                        icon={<FiZapOff />}
                      />
                    </Stack>
                  ) : (
                    <Text fontSize="sm" fontWeight="semibold">
                      Connected
                    </Text>
                  )}
                </Flex>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
