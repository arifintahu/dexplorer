import { CheckIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  HStack,
  Icon,
  IconButton,
  Img,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import {
  FiRadio,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
  FiZap,
} from 'react-icons/fi'
import { useSelector } from 'react-redux'

import { connectWebsocketClient, validateConnection } from '@/rpc/client'
import { selectRPCAddress, selectTmClient } from '@/store/connectSlice'
import { selectNewBlock } from '@/store/streamSlice'
import { fetchBitcoinPriceDifference } from '@/utils'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { removeTrailingSlash } from '@/utils/helper'
import { images } from '@/utils/images'

import BitcoinPriceDifference from '../BitcoinPriceWidget'

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
    window.localStorage.setItem(
      LS_RPC_ADDRESS_LIST,
      JSON.stringify([addr, ...rpcAddresses])
    )
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

      const tc = await connectWebsocketClient(rpcAddress)

      if (!tc) {
        setError(true)
        setState('initial')
        return
      }

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
      window.location.reload()
      setState('success')
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
        bg={'dark-bg'}
        w="100%"
        py={5}
        px={14}
        shadow={'base'}
        borderBottom="1px"
        borderBottomColor={'gray-900'}
        display={'flex'}
        justifyContent={'flex-end'}
        alignItems={'center'}
      >
        <BitcoinPriceDifference />
        <Box pl={5}>
          <Text
            fontSize={'md'}
            fontWeight={'medium'}
            color={'text-200'}
            px={6}
            py={'10px'}
            border={'1px'}
            borderColor={'text-200'}
            borderRadius={'full'}
          >
            Surge Testnet
          </Text>
        </Box>
        {/* <HStack>
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
        </HStack> */}
      </Box>
      {/* <Modal isOpen={isOpen} onClose={onClose}>
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
      </Modal> */}
    </>
  )
}
