import { Box, Text } from '@chakra-ui/react'

import BitcoinPriceDifference from '../BitcoinPriceWidget'

export default function Navbar() {
  return (
    <Box
      bg={'dark-bg'}
      w="100%"
      py={{ base: 1, md: 5 }}
      px={{ base: 1, md: 14 }}
      shadow={'base'}
      borderBottom={{ base: '0px', md: '1px' }}
      borderBottomColor={{ base: 'gray-900', md: 'gray-900' }}
      display={'flex'}
      justifyContent={'flex-end'}
      alignItems={'center'}
    >
      <BitcoinPriceDifference />
      <Box pl={5}>
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight={'medium'}
          color={'text-200'}
          px={6}
          py={'10px'}
          border={'1px'}
          borderColor={'text-200'}
          borderRadius={'full'}
        >
          Alpha Testnet
        </Text>
      </Box>
    </Box>
  )
}
