import { ReactNode, useEffect, useState } from 'react'
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
  useColorModeValue,
  Box,
  Heading,
  Text,
  HStack,
  Icon,
  IconButton,
  InputGroup,
  Input,
  Select,
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
import {
  NewBlockEvent,
  Tendermint34Client,
  WebsocketClient,
} from '@cosmjs/tendermint-rpc'
import { TxEvent } from '@cosmjs/tendermint-rpc'
import { replaceHTTPtoWebsocket } from '@/utils/helper'

export default function Layout({ children }: { children: ReactNode }) {
  const connectState = useSelector(selectConnectState)
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const dispatch = useDispatch()

  const [searchBy, setSearchBy] = useState('block')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (tmClient && !newBlock) {
      const subscription = subscribeNewBlock(tmClient, updateNewBlock)
      dispatch(setSubsNewBlock(subscription))
    }

    if (tmClient && !txEvent) {
      const subscription = subscribeTx(tmClient, updateTxEvent)
      dispatch(setSubsTxEvent(subscription))
    }
  }, [tmClient])

  useEffect(() => {
    if (isLoading) {
      const address = window.localStorage.getItem('RPC_ADDRESS')
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

  const connect = async (address: string) => {
    const wsClient = new WebsocketClient(replaceHTTPtoWebsocket(address))
    const tmClient = await Tendermint34Client.create(wsClient).catch((err) => {
      console.error(err)
    })

    if (!tmClient) {
      setIsLoading(false)
      return
    }

    dispatch(setConnectState(true))
    dispatch(setTmClient(tmClient))
    dispatch(setRPCAddress(address))

    setIsLoading(false)
  }

  return (
    <>
      {isLoading ? <LoadingPage /> : <></>}
      {connectState && !isLoading ? (
        <Sidebar>
          <Box
            bg={useColorModeValue('white', 'gray.900')}
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
                <Heading size="xs">{newBlock?.header.chainId}</Heading>
                <Text pt="2" fontSize="sm">
                  {address}
                </Text>
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
                />
              </InputGroup>
              <IconButton
                colorScheme="green"
                aria-label="Search"
                size="md"
                fontSize="20"
                icon={<FiSearch />}
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
