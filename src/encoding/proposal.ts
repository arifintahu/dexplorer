import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'

const TYPE = {
  TextProposal: '/cosmos.gov.v1beta1.TextProposal',
}

export interface DecodeContentProposal {
  typeUrl: string
  data: TextProposal | null
}

export const decodeContentProposal = (
  typeUrl: string,
  value: Uint8Array
): DecodeContentProposal => {
  let data = null
  switch (typeUrl) {
    case TYPE.TextProposal:
      data = TextProposal.decode(value)
      break
    default:
      data = TextProposal.decode(value)
      break
  }

  return {
    typeUrl,
    data,
  }
}
