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
    entityName: 'Validator Alpha',
    status: 1,
    votingPower: 12.5,
  },
  {
    signerKey: '0xB2C3D4E5F67890ABCDEF1234567890ABCDEF02A1',
    entityName: 'Validator Beta',
    status: 1,
    votingPower: 8.3,
  },
  {
    signerKey: '0xC3D4E5F67890ABCDEF1234567890ABCDEF03B2',
    entityName: 'Validator Gamma',
    status: 0,
    votingPower: 15.7,
  },
  {
    signerKey: '0xD4E5F67890ABCDEF1234567890ABCDEF04C3',
    entityName: 'Validator Delta',
    status: 1,
    votingPower: 20.1,
  },
  {
    signerKey: '0xE5F67890ABCDEF1234567890ABCDEF05D4',
    entityName: 'Validator Epsilon',
    status: 1,
    votingPower: 5.4,
  },
  {
    signerKey: '0xF67890ABCDEF1234567890ABCDEF06E5',
    entityName: 'Validator Zeta',
    status: 0,
    votingPower: 10.2,
  },
  {
    signerKey: '0x67890ABCDEF1234567890ABCDEF07F6',
    entityName: 'Validator Eta',
    status: 1,
    votingPower: 7.8,
  },
  {
    signerKey: '0x7890ABCDEF1234567890ABCDEF08G7',
    entityName: 'Validator Theta',
    status: 1,
    votingPower: 13.5,
  },
  {
    signerKey: '0x890ABCDEF1234567890ABCDEF09H8',
    entityName: 'Validator Iota',
    status: 1,
    votingPower: 6.9,
  },
  {
    signerKey: '0x90ABCDEF1234567890ABCDEF10I9',
    entityName: 'Validator Kappa',
    status: 1,
    votingPower: 18.4,
  },
]
