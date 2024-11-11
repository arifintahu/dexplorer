import {
  Box,
  Button,
  HStack,
  Img,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import router from 'next/router'
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from 'react'
import { FiCheck, FiX } from 'react-icons/fi'

import {
  capitalizeFirstLetter,
  getColor,
  getRelativeTime,
  truncate,
} from '@/utils'
import { timeFromNow } from '@/utils/helper'
import { images } from '@/utils/images'

interface ITransactionList {
  title: string
  showAll: boolean
  txs: any
}

export default function TransactionList({
  title,
  showAll,
  txs,
}: ITransactionList) {
  return (
    <Box
      pt={10}
      pb={showAll ? 1 : 5}
      border={'1px'}
      borderColor={'gray-900'}
      bg={'dark-bg'}
      borderRadius={12}
    >
      <Text
        fontWeight={'500'}
        fontSize={'16px'}
        lineHeight={'25px'}
        mb={2}
        px={6}
      >
        {title}
      </Text>
      <TableContainer>
        <Table>
          <Thead px={6}>
            <Tr>
              <Th width={'25%'}>Transaction Hash</Th>
              <Th width={'25%'}>Result</Th>
              <Th width={'10%'}>Height</Th>
              <Th width={'15%'}>Time</Th>
              {/* {showAll && <Th width={'15%'}>Fees</Th>} */}
            </Tr>
          </Thead>
          <Tbody>
            {txs.map(
              (
                transaction: {
                  hash: string
                  TxEvent: { result: { code: number } }
                  height:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | ReactFragment
                    | ReactPortal
                    | null
                    | undefined
                  Timestamp: { toISOString: () => string }
                  fees: any
                  feeValue: any
                },
                ind: Key | null | undefined
              ) => (
                <Tr
                  key={ind}
                  px={6}
                  borderBottom={'1px'}
                  borderColor={'gray-900'}
                  _last={{ borderBottom: 'none' }}
                >
                  <Td border={'none'}>
                    {/* <HashComponent
                    txHash={transaction.txHash}
                    blockHeight={transaction.blockHeight}
                    txStatus={transaction.txStatus}
                    time={transaction.time}
                  /> */}
                    # {truncate(transaction.hash, 6)}
                  </Td>
                  <Td border={'none'}>
                    {/* <Text
                    fontSize={'xs'}
                    px={2}
                    py={1}
                    color={'text-200'}
                    bg={'gray-900'}
                    borderRadius={'full'}
                    align={'center'}
                    maxW={'200px'}
                  >
                    {transaction.action}
                  </Text> */}
                    {transaction.TxEvent.result.code == 0 ? (
                      <Tag variant="subtle" colorScheme="green">
                        <TagLeftIcon as={FiCheck} />
                        <TagLabel>Success</TagLabel>
                      </Tag>
                    ) : (
                      <Tag variant="subtle" colorScheme="red">
                        <TagLeftIcon as={FiX} />
                        <TagLabel>Error</TagLabel>
                      </Tag>
                    )}
                  </Td>
                  <Td border={'none'} pr={1}>
                    <Box
                      display={'flex'}
                      gap={4}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Text fontSize={'xs'} color={'text-link'}>
                        {/* {truncate(transaction.fromAddress)} */}
                        {transaction.height}
                      </Text>
                      {/* <Img src={images.rightArrow.src} width={4} height={4} /> */}
                    </Box>
                  </Td>
                  <Td border={'none'}>
                    {' '}
                    <Text fontSize={'xs'} color={'text-link'}>
                      {/* {truncate(transaction.toAddress)} */}
                      {timeFromNow(transaction.Timestamp.toISOString())}
                    </Text>
                  </Td>
                  {/* {showAll && (
                    <Td border={'none'}>
                      <VStack gap={1} alignItems={'start'}>
                        <Text
                          className="label_regular"
                          color={'text-50'}
                        >{`${transaction.fees}`}</Text>
                        <Text
                          className="label_medium"
                          color={'text-500'}
                        >{`${transaction.feeValue}`}</Text>
                      </VStack>
                    </Td>
                  )} */}
                </Tr>
              )
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {!showAll && (
        <Box width={'full'} px={4}>
          <Button
            border={'1px'}
            borderColor={'primary-500'}
            width={'100%'}
            alignSelf={'center'}
            mt={4}
            bg={'dark-bg'}
            color={'primary-500'}
            borderRadius={'12px'}
            _hover={{
              bg: '#010101',
            }}
            onClick={() => {
              router.push('/txs')
            }}
          >
            See all transactions
          </Button>
        </Box>
      )}
    </Box>
  )
}

interface IHashComponent {
  txHash: string
  blockHeight: number
  txStatus: string
  time: string
}

const HashComponent = ({
  txHash,
  blockHeight,
  txStatus,
  time,
}: IHashComponent) => {
  return (
    <Box>
      <VStack gap={'6px'} alignItems={'start'}>
        <HStack gap={'2px'}>
          <Text
            fontWeight={'medium'}
            fontSize={'xs'}
            lineHeight={'18px'}
            color={'text-200'}
          >
            #
          </Text>
          <Text
            fontWeight={'medium'}
            fontSize={'xs'}
            lineHeight={'18px'}
            color={'text-50'}
          >
            {truncate(txHash, 6)}
          </Text>
        </HStack>
        <HStack gap={'2px'}>
          <Img src={images.blockLogo.src} width={'12px'} height={'12px'} />
          <Text fontSize={'xs'} lineHeight={'15px'} color={'primary-200'}>
            {blockHeight}
          </Text>
          <Dot />
          <Text
            color={getColor(txStatus)}
            fontSize={'xs'}
            fontWeight={'medium'}
          >
            {capitalizeFirstLetter(txStatus)}
          </Text>
          <Dot />
          <Text fontSize={'xs'} color={'text-gray-500'} lineHeight={'15px'}>
            {getRelativeTime(time)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  )
}

const Dot = () => {
  return <Box minW={'2px'} minH={'2px'} bg={'gray.300'} rounded="full" mx={1} />
}

const transactionData = [
  {
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    blockHeight: 53287,
    txStatus: 'success',
    time: '2024-11-07T10:20:00Z',
    action: 'Router Swap',
    fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    fees: '123 sats/byte',
    feeValue: '$1.03',
  },
  {
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    blockHeight: 53288,
    txStatus: 'pending',
    time: '2024-11-07T12:15:00Z',
    action: 'Token Transfer',
    fromAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    toAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    fees: '123 sats/byte',
    feeValue: '$1.03',
  },
  {
    txHash: '0x7890abcdef1234567890abcdef1234567890abcd',
    blockHeight: 53289,
    txStatus: 'error',
    time: '2024-11-07T14:30:00Z',
    action: 'Contract Call',
    fromAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    fees: '123 sats/byte',
    feeValue: '$1.03',
  },
]
