import { Box, Img, Text } from '@chakra-ui/react'

import { images } from '@/utils/images'

interface IGradientBackground {
  children: React.ReactNode
  title: string
}

export default function GradientBackground({
  children,
  title,
}: IGradientBackground) {
  return (
    <Box
      px={{ base: 4, md: 14 }}
      pt={{ base: '32px', md: '114px' }}
      position={'relative'}
      zIndex={0}
    >
      <Img
        src={images.primaryGradient.src}
        w={'100%'}
        h={'432px'}
        position={'absolute'}
        top={'0px'}
        left={'0px'}
        zIndex={1}
      />
      <Box zIndex={2} position={'relative'}>
        <Text fontWeight={'600'} color={'white'} fontSize={'40px'} mb={7}>
          {title}
        </Text>
        {children}
      </Box>
    </Box>
  )
}
