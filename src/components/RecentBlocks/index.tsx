import { Box, HStack, Image, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { shortenAddress } from '@/utils/helper'
import { images } from '@/utils/images'

export default function RecentBlocks() {
  return (
    <Box>
      <HStack justifyContent={'space-between'} mb={3}>
        <Text fontSize={'2xl'} color={'gray-50'}>
          Recent Blocks
        </Text>
        <Text fontSize={'xs'} color={'gray-400'} pr={2} fontWeight={500}>
          Auto-Updates
        </Text>
      </HStack>
      <RecentBlock />
    </Box>
  )
}

const RecentBlock = () => {
  return (
    <Box bg={'gray-1100'} borderRadius={12}>
      <Box px={4} py={5} bg="gray-1200" borderTopRadius={12}>
        <HStack justifyContent="space-between">
          <HStack gap={3}>
            <Image src={images.chainLink.src} alt="chain" />
            <HStack gap={1}>
              <Image width={5} src={images.bitcoinLogo.src} alt="bitcoin" />
              <Link
                as={NextLink}
                href={'/blocks'}
                _focus={{ boxShadow: 'none' }}
                display={'block'}
                fontSize={'14px'}
                color={'yellow-100'}
              >
                #291203
              </Link>
            </HStack>
          </HStack>
          <HStack gap={1}>
            <Link
              as={NextLink}
              href={'/blocks'}
              _focus={{ boxShadow: 'none' }}
              fontSize={'xs'}
              color={'gray-500'}
              textDecoration={'underline'}
            >
              {shortenAddress(
                '0x00000000000000000001e4add93ab2a51d8d405d60177fd30f791027deefaffd'
              )}
            </Link>
            <Box w={1} h={1} bg={'gray-500'} borderRadius={99} />
            <Text fontSize={'xs'} color={'gray-400'}>
              2hr ago
            </Text>
          </HStack>
        </HStack>
      </Box>
      <Box px={4} pt={'30px'} pb={'14px'}></Box>
      <Box px={4} py={5} bg="gray-1200" borderBottomRadius={12}>
        <HStack gap={2}>
          <Image w={4} src={images.stars.src} alt="" />
          <HStack>
            <Text fontSize={'xs'} color={'gray-400'}>
              120 txns
            </Text>
            <Box w={1} h={1} bg={'gray-500'} borderRadius={99} />
            <Text fontSize={'xs'} color={'gray-400'}>
              12 blocks
            </Text>
            <Box w={1} h={1} bg={'gray-500'} borderRadius={99} />
            <Text fontSize={'xs'} color={'gray-400'}>
              ~6s settlement
            </Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
