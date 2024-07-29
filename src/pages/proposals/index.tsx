import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Text,
  useToast,
  useColorModeValue,
  Tag,
  Badge,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectTmClient } from '@/store/connectSlice'
import { queryProposals } from '@/rpc/abci'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { getTypeMsg, displayDate } from '@/utils/helper'
import { proposalStatus, proposalStatusList } from '@/utils/constant'
import { decodeContentProposal } from '@/encoding'

type Proposal = {
  id: number
  title: string
  types: string
  status: proposalStatus | undefined
  votingEnd: string
}

const columnHelper = createColumnHelper<Proposal>()

const columns = [
  columnHelper.accessor('id', {
    cell: (info) => `#${info.getValue()}`,
    header: '#ID',
  }),
  columnHelper.accessor('title', {
    cell: (info) => info.getValue(),
    header: 'Title',
  }),
  columnHelper.accessor('types', {
    cell: (info) => <Tag colorScheme="cyan">{info.getValue()}</Tag>,
    header: 'Types',
  }),
  columnHelper.accessor('status', {
    cell: (info) => {
      const value = info.getValue()
      if (!value) {
        return ''
      }
      return <Badge colorScheme={value.color}>{value.status}</Badge>
    },
    header: 'Status',
  }),
  columnHelper.accessor('votingEnd', {
    cell: (info) => info.getValue(),
    header: 'Voting End',
  }),
]

export default function Proposals() {
  const tmClient = useSelector(selectTmClient)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (tmClient) {
      setIsLoading(true)
      queryProposals(tmClient, page, perPage)
        .then((response) => {
          setTotal(response.pagination?.total.low ?? 0)
          const proposalsList: Proposal[] = response.proposals.map((val) => {
            const votingEnd = val.votingEndTime?.nanos
              ? new Date(val.votingEndTime?.seconds.low * 1000).toISOString()
              : null
            const content = decodeContentProposal(
              val.content?.typeUrl ?? '',
              val.content?.value ?? new Uint8Array()
            )
            return {
              id: val.proposalId.low,
              title: content.data?.title ?? '',
              types: getTypeMsg(val.content?.typeUrl ?? ''),
              status: proposalStatusList.find(
                (item) => item.id === Number(val.status.toString())
              ),
              votingEnd: votingEnd ? displayDate(votingEnd) : '',
            }
          })
          setProposals(proposalsList)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: 'Failed to fetch proposals',
            description: '',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        })
    }
  }, [tmClient, page, perPage])

  const onChangePagination = (value: {
    pageIndex: number
    pageSize: number
  }) => {
    setPage(value.pageIndex)
    setPerPage(value.pageSize)
  }

  return (
    <>
      <Head>
        <title>Proposals | Dexplorer</title>
        <meta name="description" content="Proposals | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Proposals</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon
              fontSize="16"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon fontSize="16" as={FiChevronRight} />
          <Text>Proposals</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <DataTable
            columns={columns}
            data={proposals}
            total={total}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        </Box>
      </main>
    </>
  )
}
