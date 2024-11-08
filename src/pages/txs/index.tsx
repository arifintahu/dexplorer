import { Box, Grid, GridItem, Img, Text } from '@chakra-ui/react'

import GradientBackground from '@/components/shared/GradientBackground'
import { images } from '@/utils/images'

export default function Transactions() {
  return (
    <GradientBackground title="Transactions">
      <Grid templateColumns="repeat(12, 1fr)" gap={5}>
        <GridItem colSpan={4} h={20} bg={'orange'}></GridItem>
        <GridItem colSpan={8} h={20} bg={'pink'}></GridItem>
      </Grid>
    </GradientBackground>
  )
}
