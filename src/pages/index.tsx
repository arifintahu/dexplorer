import Head from 'next/head'
import {
  useColorModeValue,
  FlexProps,
  Heading,
  Divider,
  HStack,
  Icon,
  Link,
  Text,
  SimpleGrid,
  Box,
  VStack,
} from '@chakra-ui/react'
import {
  FiHome,
  FiChevronRight,
  FiBox,
  FiClock,
  FiCpu,
  FiUsers,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getDashboard, ResponseDashboard } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'

export default function Home() {
  const tmClient = useSelector(selectTmClient)
  const [dashboard, setDashboard] = useState<ResponseDashboard | null>(null)

  useEffect(() => {
    if (tmClient) {
      getDashboard(tmClient).then(setDashboard)
    }
  }, [tmClient])

  return (
    <>
      <Head>
        <title>Home | Dexplorer</title>
        <meta name="description" content="Home | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Home</Heading>
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
          <Text>Home</Text>
        </HStack>
        <Box mt={8}>
          <SimpleGrid minChildWidth="200px" spacing="40px">
            <BoxInfo
              bgColor="cyan.200"
              color="cyan.600"
              icon={FiBox}
              name="Height"
              value={dashboard?.latestBlockHeight}
            />
            <BoxInfo
              bgColor="green.200"
              color="green.600"
              icon={FiClock}
              name="Update"
              value={dashboard?.latestBlockTime.toLocaleString()}
            />
            <BoxInfo
              bgColor="orange.200"
              color="orange.600"
              icon={FiCpu}
              name="Network"
              value={dashboard?.network}
            />
            <BoxInfo
              bgColor="purple.200"
              color="purple.600"
              icon={FiUsers}
              name="Validators"
              value={dashboard?.totalValidators}
            />
          </SimpleGrid>
        </Box>
      </main>
    </>
  )
}

interface BoxInfoProps extends FlexProps {
  bgColor: string
  color: string
  icon: IconType
  name: string
  value: string | number | undefined
}
const BoxInfo = ({
  bgColor,
  color,
  icon,
  name,
  value,
  ...rest
}: BoxInfoProps) => {
  return (
    <VStack
      bg={useColorModeValue('white', 'gray.900')}
      shadow={'base'}
      borderRadius={4}
      p={4}
      height="150px"
    >
      <Box
        backgroundColor={bgColor}
        padding={2}
        height="40px"
        width="40px"
        borderRadius={'full'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        mb={2}
      >
        <Icon fontSize="20" color={color} as={icon} />
      </Box>
      <Heading size={'md'}>{value}</Heading>
      <Text size={'sm'}>{name}</Text>
    </VStack>
  )
}
