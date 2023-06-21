import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { selectTmClient, selectRPCAddress } from '@/store/connectSlice'
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
} from '@chakra-ui/react'
import { FiRadio, FiSearch } from 'react-icons/fi'
import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

const heightRegex = /^\d+$/
const txhashRegex = /^[A-Z\d]{64}$/
const addrRegex = /^[a-z\d]+1[a-z\d]{38,58}$/

export default function Navbar() {
  const router = useRouter()
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const dispatch = useDispatch()
  const toast = useToast()

  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [inputSearch, setInputSearch] = useState('')
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)

  useEffect(() => {
    if (newBlock) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, txEvent, dispatch])

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
              borderColor={'gray.900'}
              placeholder="Height/Transaction/Account Address"
              onChange={handleInputSearch}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="cyan"
              w="full"
              textTransform="uppercase"
              onClick={handleSearch}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
