import { ReactNode, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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
import { getChainId } from '@/rpc/query'

export default function Layout({ children }: { children: ReactNode }) {
  const connectState = useSelector(selectConnectState)
  const tmClient = useSelector(selectTmClient)
  const address = useSelector(selectRPCAddress)
  const [chainId, setChainId] = useState('')

  useEffect(() => {
    if (tmClient) {
      getChainId(tmClient).then(setChainId)
    }
  }, [tmClient])

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
                <Heading size="xs">{chainId}</Heading>
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
