import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../Sidebar'
import Connect from '../Connect'
import LoadingPage from '../LoadingPage'
import {
  selectConnectState,
  selectTmClient,
  selectRPCAddress,
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import {
  Box,
  Heading,
  Text,
  HStack,
  Icon,
  IconButton,
  InputGroup,
  Input,
  Select,
  Skeleton,
} from '@chakra-ui/react'
import { FiRadio, FiSearch } from 'react-icons/fi'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import {
  setNewBlock,
  selectNewBlock,
  setTxEvent,
  selectTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
} from '@/store/streamSlice'
import { NewBlockEvent } from '@cosmjs/tendermint-rpc'
import { TxEvent } from '@cosmjs/tendermint-rpc'
import { LS_RPC_ADDRESS } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const connectState = useSelector(selectConnectState)
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const dispatch = useDispatch()

  const [searchBy, setSearchBy] = useState('block')
  const [inputSearch, setInputSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)

  useEffect(() => {
    if (tmClient && !newBlock) {
      const subscription = subscribeNewBlock(tmClient, updateNewBlock)
      dispatch(setSubsNewBlock(subscription))
    }

    if (tmClient && !txEvent) {
      const subscription = subscribeTx(tmClient, updateTxEvent)
      dispatch(setSubsTxEvent(subscription))
    }

    if (newBlock) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, txEvent, dispatch])

  useEffect(() => {
    if (isLoading) {
      const address = window.localStorage.getItem(LS_RPC_ADDRESS)
      if (!address) {
        setIsLoading(false)
        return
      }

      connect(address)
    }
  }, [isLoading])

  const updateNewBlock = (event: NewBlockEvent): void => {
    dispatch(setNewBlock(event))
  }

  const updateTxEvent = (event: TxEvent): void => {
    dispatch(setTxEvent(event))
  }

  const handleSelect = (event: any) => {
    setSearchBy(event.target.value as string)
  }

  const handleInputSearch = (event: any) => {
    setInputSearch(event.target.value as string)
  }

  const handleSearch = () => {
    let path = '/blocks'
    if (inputSearch) {
      switch (searchBy) {
        case 'block':
          path = '/blocks/'
          break

        case 'tx hash':
          path = '/txs/'
          break

        case 'account':
          path = '/accounts/'
          break

        default:
          break
      }
    }

    router.push(path + inputSearch)
    return
  }

  const connect = async (address: string) => {
    try {
      const isValid = await validateConnection(address)
      if (!isValid) {
        window.localStorage.removeItem(LS_RPC_ADDRESS)
        setIsLoading(false)
        return
      }

      const tmClient = await connectWebsocketClient(address)
      if (!tmClient) {
        window.localStorage.removeItem(LS_RPC_ADDRESS)
        setIsLoading(false)
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(address))

      setIsLoading(false)
    } catch (err) {
      console.error(err)
      window.localStorage.removeItem(LS_RPC_ADDRESS)
      setIsLoading(false)
      return
    }
  }

  return (
    <>
      {isLoading ? <LoadingPage /> : <></>}
      {connectState && !isLoading ? (
        <Sidebar>
          <Box
            bg="white"
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
              <Box>
                <Skeleton isLoaded={isLoadedSkeleton}>
                  <Heading size="xs">{newBlock?.header.chainId}</Heading>
                </Skeleton>
                <Skeleton isLoaded={isLoadedSkeleton}>
                  <Text pt="2" fontSize="sm">
                    {address}
                  </Text>
                </Skeleton>
              </Box>
            </HStack>
            <HStack>
              <InputGroup size="md">
                <Select
                  variant={'outline'}
                  defaultValue="block"
                  borderColor={'gray.900'}
                  width={110}
                  isRequired
                  onChange={handleSelect}
                >
                  <option value="block">Block</option>
                  <option value="tx hash">Tx Hash</option>
                  <option value="account">Account</option>
                </Select>
                <Input
                  width={400}
                  type={'text'}
                  borderColor={'gray.900'}
                  placeholder={`Search by ${searchBy}`}
                  onChange={handleInputSearch}
                />
              </InputGroup>
              <IconButton
                colorScheme="green"
                aria-label="Search"
                size="md"
                fontSize="20"
                icon={<FiSearch />}
                onClick={handleSearch}
              />
            </HStack>
          </Box>
          {children}
        </Sidebar>
      ) : (
        <></>
      )}
      {!connectState && !isLoading ? <Connect /> : <></>}
    </>
  )
}
