import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { MsgUpdateClient } from 'cosmjs-types/ibc/core/client/v1/tx'
import {
  MsgAcknowledgement,
  MsgRecvPacket,
} from 'cosmjs-types/ibc/core/channel/v1/tx'
import {
  MsgExec,
  MsgGrant,
  MsgRevoke,
} from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

const TYPE = {
  MsgSend: '/cosmos.bank.v1beta1.MsgSend',
  MsgWithdrawDelegatorReward:
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MsgDelegate: '/cosmos.staking.v1beta1.MsgDelegate',
  MsgUpdateClient: '/ibc.core.client.v1.MsgUpdateClient',
  MsgAcknowledgement: '/ibc.core.channel.v1.MsgAcknowledgement',
  MsgRecvPacket: '/ibc.core.channel.v1.MsgRecvPacket',
  MsgExec: '/cosmos.authz.v1beta1.MsgExec',
  MsgGrant: '/cosmos.authz.v1beta1.MsgGrant',
  MsgRevoke: '/cosmos.authz.v1beta1.MsgRevoke',
  MsgTransfer: '/ibc.applications.transfer.v1.MsgTransfer',
}

export interface DecodeMsg {
  typeUrl: string
  data: Object | null
}

export const decodeMsg = (typeUrl: string, value: Uint8Array): DecodeMsg => {
  let data = null
  switch (typeUrl) {
    case TYPE.MsgSend:
      data = MsgSend.decode(value)
      break
    case TYPE.MsgWithdrawDelegatorReward:
      data = MsgWithdrawDelegatorReward.decode(value)
      break
    case TYPE.MsgDelegate:
      data = MsgDelegate.decode(value)
      break
    case TYPE.MsgUpdateClient:
      data = MsgUpdateClient.decode(value)
      break
    case TYPE.MsgAcknowledgement:
      data = MsgAcknowledgement.decode(value)
      break
    case TYPE.MsgRecvPacket:
      data = MsgRecvPacket.decode(value)
      break
    case TYPE.MsgExec:
      data = MsgExec.decode(value)
      break
    case TYPE.MsgGrant:
      data = MsgGrant.decode(value)
      break
    case TYPE.MsgRevoke:
      data = MsgRevoke.decode(value)
      break
    case TYPE.MsgTransfer:
      data = MsgTransfer.decode(value)
      break
    default:
      break
  }

  return {
    typeUrl,
    data,
  }
}
