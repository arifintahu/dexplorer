import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import Sidebar from '../Sidebar'
import Connect from '../Connect'
import { selectConnectState } from '@/store/connectSlice'
import {
  useColorModeValue,
  Box,
} from '@chakra-ui/react'

export default function Layout({ children }: { children: ReactNode }) {
  const connectState = useSelector(selectConnectState)

  return (
    <>
      {connectState ? (
        <Sidebar>
          <Box
            bg={useColorModeValue('white', 'gray.900')}
            w='100%'
            p={4}
            shadow={'base'}
            borderRadius={4}
            marginBottom={4}
          >
            This is the Box
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
