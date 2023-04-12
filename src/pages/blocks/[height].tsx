import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function DetailBlock() {
  const router = useRouter()
  const { height } = router.query

  return (
    <>
      <Head>
        <title>Detail Block | Dexplorer</title>
        <meta name="description" content="Home | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Block</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Icon fontSize="16" color={'cyan.400'} as={FiHome} />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Link
            as={NextLink}
            href={'/blocks'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text color={'cyan.400'}>Blocks</Text>
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Block #{height}</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.900')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Header
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          <TableContainer>
            <Table variant="unstyled" size={'sm'}>
              <Tbody>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Chain Id</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Height</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Block Time</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Block Hash</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Number of Tx</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Gas (used / wanted)</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Block Round</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={200}>
                    <b>Proposer</b>
                  </Td>
                  <Td>1234</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          mt={8}
          bg={useColorModeValue('white', 'gray.900')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Transactions
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Result</Th>
                  <Th>Messages</Th>
                  <Th>Height</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody></Tbody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </>
  )
}
