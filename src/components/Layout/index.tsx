import { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../Sidebar'
import Connect from '../Connect'
import {
  selectConnectState,
  selectTmClient,
  selectRPCAddress,
} from '@/store/connectSlice'
import {
  useColorModeValue,
  Box,
  Heading,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { FiRadio } from 'react-icons/fi'
import { subscribeNewBlock } from '@/rpc/query'
import {
  setNewBlock,
  selectNewBlock,
  selectNewBlockState,
  setNewBlockState,
} from '@/store/streamSlice'
import { NewBlockEvent } from '@cosmjs/tendermint-rpc'

export default function Layout({ children }: { children: ReactNode }) {
  const connectState = useSelector(selectConnectState)
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const newBlock = useSelector(selectNewBlock)
  const newBlockState = useSelector(selectNewBlockState)
  const dispatch = useDispatch()

  useEffect(() => {
    if (tmClient && !newBlockState) {
      subscribeNewBlock(tmClient, updateNewBlock)
    }
  }, [tmClient])

  const updateNewBlock = (event: NewBlockEvent): void => {
    dispatch(setNewBlock(event))
    dispatch(setNewBlockState(true))
  }

  return (
    <>
      {connectState ? (
        <Sidebar>
          <Box
            bg={useColorModeValue('white', 'gray.900')}
            w="100%"
            p={4}
            shadow={'base'}
            borderRadius={4}
            marginBottom={4}
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
          </Box>
          {children}
        </Sidebar>
      ) : (
        <div>
          <Connect />
        </div>
      )}
    </>
  )
}
