import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'

import { getColor, truncate } from '@/utils'

interface IValidatorsList {
  title: string
}

export default function ValidatorsList({ title }: IValidatorsList) {
  return (
    <Box
      pt={10}
      pb={1}
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
        color={'text-50'}
      >
        {title}
      </Text>
      <TableContainer>
        <Table>
          <Thead px={6}>
            <Tr>
              <Th
                borderColor={'gray-900'}
                color={'text-500'}
                width={'20%'}
                className="label_regular"
              >
                Validators
              </Th>
              <Th borderColor={'gray-900'} color={'text-500'} width={'20%'}>
                Status
              </Th>
              <Th borderColor={'gray-900'} color={'text-500'} width={'20%'}>
                Address Associated
              </Th>
              <Th borderColor={'gray-900'} color={'text-500'} width={'15%'}>
                Voting Power
              </Th>
              <Th borderColor={'gray-900'} color={'text-500'} width={'15%'}>
                Commission
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {validators.map((validator, ind) => (
              <Tr
                key={ind}
                px={6}
                borderBottom={'1px'}
                borderColor={'gray-900'}
                _last={{ borderBottom: 'none' }}
              >
                <Td border={'none'}>
                  <Text className="body2_regular" color={'white'}>
                    {validator.name}
                  </Text>
                </Td>
                <Td border={'none'}>
                  <Text
                    px={2}
                    py={1}
                    borderRadius={'8px'}
                    bg={getColor(validator.status)}
                    className="label_regular"
                    color={'white'}
                    width={'max-content'}
                    textAlign={'center'}
                  >
                    {validator.status == 1 ? 'Active' : 'Inactive'}
                  </Text>
                </Td>
                <Td
                  border={'none'}
                  className="supportText_semibold"
                  color={'text-50'}
                >{`# ${truncate(validator.address)}`}</Td>
                <Td border={'none'} className="body2_regular" color={'text-50'}>
                  {validator.votingPower}
                </Td>
                <Td
                  border={'none'}
                  className="body2_regular"
                  color={'text-50'}
                >{`${validator.commission}`}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const validators = [
  {
    name: 'Foundation 1',
    status: 1,
    active: true,
    address: '0xC09368ACD3024C7E293395ABC123456789ABCDEF',
    votingPower: 60,
    commission: '60%',
  },
  {
    name: 'Foundation 2',
    status: 1,
    active: true,
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    votingPower: 30,
    commission: '30%',
  },
  {
    name: 'Foundation 3',
    status: 1,
    active: true,
    address: '0x06e70f295B6337c213DDe82D13cc198027687A7B',
    votingPower: 10,
    commission: '10%',
  },
]
