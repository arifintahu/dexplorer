import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  useColorModeValue,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectTmClient } from '@/store/connectSlice'
import { queryActiveValidators } from '@/rpc/abci'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { convertRateToPercent, convertVotingPower } from '@/utils/helper'

type ValidatorData = {
  validator: string
  status: string
  votingPower: string
  commission: string
}

const columnHelper = createColumnHelper<ValidatorData>()

const columns = [
  columnHelper.accessor('validator', {
    cell: (info) => info.getValue(),
    header: 'Validator',
  }),
  columnHelper.accessor('status', {
    cell: (info) => info.getValue(),
    header: 'Status',
  }),
  columnHelper.accessor('votingPower', {
    cell: (info) => info.getValue(),
    header: 'Voting Power',
    meta: {
      isNumeric: true,
    },
  }),
  columnHelper.accessor('commission', {
    cell: (info) => info.getValue(),
    header: 'Commission',
    meta: {
      isNumeric: true,
    },
  }),
]

export default function Validators() {
  const tmClient = useSelector(selectTmClient)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (tmClient) {
      setIsLoading(true)
      queryActiveValidators(tmClient, page, perPage)
        .then((response) => {
          setTotal(response.pagination?.total.low ?? 0)
          const validatorData: ValidatorData[] = response.validators.map(
            (val) => {
              return {
                validator: val.description?.moniker ?? '',
                status: val.status === 3 ? 'Active' : '',
                votingPower: convertVotingPower(val.tokens),
                commission: convertRateToPercent(
                  val.commission?.commissionRates?.rate
                ),
              }
            }
          )
          setData(validatorData)
          setIsLoading(false)
        })
        .catch(() => {
          toast({
            title: 'Failed to fetch datatable',
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
        <title>Blocks | Dexplorer</title>
        <meta name="description" content="Blocks | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Validators</Heading>
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
          <Text>Validators</Text>
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
            data={data}
            total={total}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        </Box>
      </main>
    </>
  )
}
