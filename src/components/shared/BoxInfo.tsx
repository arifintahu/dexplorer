import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  FlexProps,
  Heading,
  HStack,
  Icon,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'

interface BoxInfoProps extends FlexProps {
  name: string
  value: string | number | undefined
  tooltipText: string
  height?: { base: string; md: string }
}
export const BoxInfo = ({ name, value, tooltipText, height }: BoxInfoProps) => {
  return (
    <VStack
      bg={'gray-1000'}
      borderRadius={12}
      p={4}
      pb={2}
      height={height ?? '100px'}
      border={'1px'}
      borderColor={'gray-900'}
      align={'flex-start'}
    >
      <HStack mb={'14px'}>
        <Heading size={'xs'} color={'gray-500'} fontWeight={500}>
          {name}
        </Heading>
        <Tooltip
          label={tooltipText}
          placement="right"
          bg="gray.300"
          color="black"
        >
          <Icon as={InfoOutlineIcon} w={'13px'} color="gray-500" />
        </Tooltip>
      </HStack>

      <Text fontSize={'2xl'} color={'white'} fontWeight={500}>
        {value}
      </Text>
    </VStack>
  )
}
