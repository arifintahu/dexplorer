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
  InputGroup,
  Input,
  Select,
  Skeleton,
} from '@chakra-ui/react'
import { FiRadio, FiSearch } from 'react-icons/fi'
import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'

export default function Navbar() {
  const router = useRouter()
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const dispatch = useDispatch()

  const [searchBy, setSearchBy] = useState('block')
  const [inputSearch, setInputSearch] = useState('')
  const [isLoadedSkeleton, setIsLoadedSkeleton] = useState(false)

  useEffect(() => {
    if (newBlock) {
      setIsLoadedSkeleton(true)
    }
  }, [tmClient, newBlock, txEvent, dispatch])

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

  return (
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
  )
}
