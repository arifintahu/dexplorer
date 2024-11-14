import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { Block, Coin, IndexedTx } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiCheck, FiChevronRight, FiHome, FiX } from 'react-icons/fi'
import { useSelector } from 'react-redux'

import CopyIcon from '@/components/shared/CopyIcon'
import GradientBackground from '@/components/shared/GradientBackground'
import { DecodeMsg, decodeMsg } from '@/encoding'
import { getBlock, getTx } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { truncate } from '@/utils'
import {
  displayDate,
  getTypeMsg,
  isBech32Address,
  timeFromNow,
} from '@/utils/helper'
import { images } from '@/utils/images'

interface TxAttribute {
  readonly key: string
  readonly value: string
}

interface TxEvent {
  type: string
  readonly attributes: readonly TxAttribute[]
}

export default function DetailBlock() {
  const router = useRouter()
  const toast = useToast()
  const { hash } = router.query
  const tmClient = useSelector(selectTmClient)
  const [tx, setTx] = useState<IndexedTx | null>(null)
  const [txData, setTxData] = useState<Tx | null>(null)
  const [block, setBlock] = useState<Block | null>(null)
  const [msgs, setMsgs] = useState<DecodeMsg[]>([])

  useEffect(() => {
    if (tmClient && hash) {
      getTx(tmClient, hash as string)
        .then(setTx)
        .catch(showError)
    }
  }, [tmClient, hash])

  useEffect(() => {
    if (tmClient && tx?.height) {
      getBlock(tmClient, tx?.height).then(setBlock).catch(showError)
    }
  }, [tmClient, tx])

  useEffect(() => {
    if (tx?.tx) {
      const data = Tx.decode(tx?.tx)
      setTxData(data)
    }
  }, [tx])

  useEffect(() => {
    if (txData?.body?.messages.length && !msgs.length) {
      for (const message of txData?.body?.messages) {
        const msg = decodeMsg(message.typeUrl, message.value)
        setMsgs((prevMsgs) => [...prevMsgs, msg])
      }
    }
  }, [txData])

  console.log(txData, 'data')

  console.log(block, 'block data')

  const getFee = (fees: Coin[] | undefined) => {
    if (fees && fees.length) {
      return (
        <HStack>
          <Text>{fees[0].amount}</Text>
          <Text textColor="primary-700">{fees[0].denom}</Text>
        </HStack>
      )
    }
    return ''
  }

  const showMsgData = (msgData: any) => {
    if (msgData) {
      if (Array.isArray(msgData)) {
        return JSON.stringify(msgData)
      }

      if (!Array.isArray(msgData) && msgData.length) {
        if (isBech32Address(msgData)) {
          return (
            <Link
              as={NextLink}
              href={'/accounts/' + msgData}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
            >
              <Text color={'cyan.400'}>{msgData}</Text>
            </Link>
          )
        } else {
          return String(msgData)
        }
      }
    }

    return ''
  }

  const showError = (err: Error) => {
    const errMsg = err.message
    let error = null
    try {
      error = JSON.parse(errMsg)
    } catch (e) {
      error = {
        message: 'Invalid',
        data: errMsg,
      }
    }

    toast({
      title: error.message,
      description: error.data,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  const getTransferDetails = (events: TxEvent[] | undefined) => {
    if (!events?.length) {
      return {
        amount: '0surg',
        sender: '',
        recipient: '',
      }
    }

    // Initialize with default values
    const details = {
      amount: '0surg',
      sender: '',
      recipient: '',
    }

    // Find the first transfer event with the attributes we need
    const transferEvent = events.find((event) =>
      event.attributes.some((attr) =>
        ['amount', 'sender', 'recipient'].includes(attr.key)
      )
    )

    if (transferEvent) {
      transferEvent.attributes.forEach((attr) => {
        if (attr.key in details) {
          details[attr.key as keyof typeof details] = attr.value
        }
      })
    }

    return details
  }

  const txTransferEvent = tx?.events.filter(
    (event) => event.type === 'transfer'
  )
  const { amount, sender, recipient } = getTransferDetails(txTransferEvent)

  console.log(tx, 'transaction')

  return (
    <>
      <Head>
        <title>Detail Transaction | Surge Explorer</title>
        <meta name="description" content="Txs | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <GradientBackground title="Transaction Details">
          <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={10}>
            <GridItem colSpan={{ base: 12, md: 8 }}>
              <Box
                mt={8}
                bg={'#2A313A66'}
                shadow={'base'}
                borderRadius={'xl'}
                p={4}
              >
                <Text
                  size={'md'}
                  mb={4}
                  className="body2_medium"
                  color={'text-500'}
                >
                  OVERVIEW
                </Text>
                <TableContainer>
                  <Table variant="unstyled" size={'sm'}>
                    <Tbody>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4} pr={16}>
                          <Text className="body2_regular" color={'text-500'}>
                            Amount
                          </Text>
                        </Td>
                        <Td color={'text-50'}>
                          {getFee(txData?.authInfo?.fee?.amount)}
                        </Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Sender
                          </Text>
                        </Td>
                        <Td color={'text-50'}>{sender}</Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Recipient
                          </Text>
                        </Td>
                        <Td color={'text-50'}>{recipient}</Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Chain Id
                          </Text>
                        </Td>
                        <Td color={'text-50'}>{block?.header.chainId}</Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Status
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          {tx?.code == 0 ? (
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
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Tx Hash
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          {tx?.hash}
                        </Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Height
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          <Link
                            as={NextLink}
                            href={'/blocks/' + tx?.height}
                            style={{ textDecoration: 'none' }}
                            _focus={{ boxShadow: 'none' }}
                          >
                            <Text>{`#${tx?.height}`}</Text>
                          </Link>
                        </Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Time
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          {block?.header.time
                            ? `${timeFromNow(
                                block?.header.time
                              )} ( ${displayDate(block?.header.time)} )`
                            : ''}
                        </Td>
                      </Tr>
                      <Tr borderBottom="1px solid" borderColor="gray-900">
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            {'Gas (used / wanted)'}
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          {`(${tx?.gasUsed} / ${tx?.gasWanted})`}
                        </Td>
                      </Tr>
                      <Tr>
                        {' '}
                        {/* Last row doesn't need a border */}
                        <Td pl={0} width={150} pt={3} pb={4}>
                          <Text className="body2_regular" color={'text-500'}>
                            Memo
                          </Text>
                        </Td>
                        <Td pt={3} pb={4} color={'text-50'}>
                          {txData?.body?.memo}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 4 }}>
              <Box
                mt={8}
                // bg={useColorModeValue('light-container', 'dark-container')}
                bg={'#2A313A66'}
                shadow={'base'}
                borderRadius={'xl'}
                p={4}
              >
                <Text
                  size={'md'}
                  mb={4}
                  className="body2_medium"
                  color={'text-500'}
                >
                  BITCOIN ANCHOR
                </Text>
                <VStack w={'100%'} justifyContent={'start'} gap={6}>
                  <HStack w={'full'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'40%'}
                    >
                      Block Height
                    </Text>

                    <Link
                      as={NextLink}
                      href={'/blocks/' + tx?.height}
                      style={{ textDecoration: 'none' }}
                      _focus={{ boxShadow: 'none' }}
                      w={'full'}
                    >
                      <Text>{`#${tx?.height}`}</Text>
                    </Link>
                  </HStack>
                  <HStack w={'full'} textAlign={'left'}>
                    <Text
                      className="body2_regular"
                      color={'text-500'}
                      w={'40%'}
                    >
                      Block Hash
                    </Text>
                    <HStack gap={2} w={'full'}>
                      <Text className="body2_regular" color={'text-50'}>
                        {truncate(block?.id ?? '')}
                      </Text>
                      <CopyIcon
                        text={block?.id ?? ''}
                        icon={images.copyIcon.src}
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </GradientBackground>
      </Box>
    </>
  )
}
