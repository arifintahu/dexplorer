import {
  Box,
  Button,
  HStack,
  Img,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
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
      >
        {title}
      </Text>
      <TableContainer>
        <Table>
          <Thead px={6}>
            <Tr>
              <Th width={'20%'} className="label_regular">
                Validators
              </Th>
              <Th width={'20%'}>Status</Th>
              <Th width={'20%'}>Address Associated</Th>
              <Th width={'15%'}>Voting Power</Th>
              <Th width={'15%'}>Commission</Th>
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
                  <Text className="body2_regular">{validator.name}</Text>
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
                >{`# ${truncate(validator.address)}`}</Td>
                <Td border={'none'} className="body2_regular">
                  {validator.votingPower}
                </Td>
                <Td
                  border={'none'}
                  className="body2_regular"
                >{`${validator.commission}%`}</Td>
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
    name: 'Foundation',
    status: 1,
    active: true,
    address: '0xC09368ACD3024C7E293395ABC123456789ABCDEF',
    votingPower: 23.89,
    commission: '23.89%',
  },
  {
    name: 'Chorus',
    status: 1,
    active: true,
    address: '0xC09368ACD3024C7E293395ABC123456789ABCDEF',
    votingPower: 23.89,
    commission: '23.89%',
  },
  {
    name: 'Radius',
    status: 0,
    active: false,
    address: '0xC09368ACD3024C7E293395ABC123456789ABCDEF',
    votingPower: 23.89,
    commission: '23.89%',
  },
  {
    name: 'Magma',
    status: 1,
    active: true,
    address: '0xC09368ACD3024C7E293395ABC123456789ABCDEF',
    votingPower: 23.89,
    commission: '23.89%',
  },
]
