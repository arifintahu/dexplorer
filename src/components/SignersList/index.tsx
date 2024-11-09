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

interface ISignersList {
  title: string
}

export default function SignersList({ title }: ISignersList) {
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
                Signer Key
              </Th>
              <Th width={'20%'} className="label_regular">
                Status
              </Th>
              <Th width={'20%'}>Entity</Th>
              <Th width={'15%'}>Voting Power</Th>
            </Tr>
          </Thead>
          <Tbody>
            {signerKeyData.map((signer, ind) => (
              <Tr
                key={ind}
                px={6}
                borderBottom={'1px'}
                borderColor={'gray-900'}
                _last={{ borderBottom: 'none' }}
              >
                <Td border={'none'}>
                  <Text className="body2_regular">
                    {truncate(signer.signerKey, 8)}
                  </Text>
                </Td>

                <Td border={'none'} className="body2_regular">
                  <Text
                    px={2}
                    py={1}
                    borderRadius={'8px'}
                    bg={getColor(signer.status)}
                    className="label_regular"
                    color={'white'}
                    width={'max-content'}
                    textAlign={'center'}
                  >
                    {signer.status == 1 ? 'Active' : 'Inactive'}
                  </Text>
                </Td>
                <Td border={'none'} className="body2_regular">
                  {signer.entityName}
                </Td>
                <Td
                  border={'none'}
                  className="body2_regular"
                >{`${signer.votingPower}%`}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const signerKeyData = [
  {
    signerKey: '0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF01',
    entityName: 'Signer 1',
    status: 1,
    votingPower: 40,
  },
  {
    signerKey: '0xB2C3D4E5F67890ABCDEF1234567890ABCDEF02A1',
    entityName: 'Signer 2',
    status: 1,
    votingPower: 40,
  },
  {
    signerKey: '0xC3D4E5F67890ABCDEF1234567890ABCDEF03B2',
    entityName: 'Signer Gamma',
    status: 0,
    votingPower: 20,
  },
]
