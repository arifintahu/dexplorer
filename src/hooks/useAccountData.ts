import { useEffect, useState, useMemo } from 'react'
import { TxResponse } from '@cosmjs/tendermint-rpc'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { useQuery } from '@tanstack/react-query'
import {
  getAccount,
  getAllBalances,
  getBalanceStaked,
  getTxsBySender,
} from '@/rpc/query'
import { decodeMsg, DecodeMsg } from '@/encoding'
import { useClientStore } from '@/store/clientStore'

export interface DecodedTx {
  tx: TxResponse
  msgs: DecodeMsg[]
}

export const useAccountData = (address: string | undefined) => {
  const tmClient = useClientStore((state) => state.tmClient)

  const {
    data: account,
    isLoading: isAccountLoading,
    error: accountError,
  } = useQuery({
    queryKey: ['account', address],
    queryFn: () => (tmClient && address ? getAccount(tmClient, address) : null),
    enabled: !!tmClient && !!address,
  })

  const { data: balances = [] } = useQuery({
    queryKey: ['balances', address],
    queryFn: () =>
      tmClient && address ? getAllBalances(tmClient, address) : [],
    enabled: !!tmClient && !!address,
  })

  const { data: stakedBalance } = useQuery({
    queryKey: ['stakedBalance', address],
    queryFn: () =>
      tmClient && address ? getBalanceStaked(tmClient, address) : null,
    enabled: !!tmClient && !!address,
  })

  const { data: txData } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () =>
      tmClient && address
        ? getTxsBySender(tmClient, address, 1, 10)
        : { txs: [], totalCount: 0 },
    enabled: !!tmClient && !!address,
  })

  const transactions = useMemo(() => {
    if (!txData) return []
    return Array.isArray(txData) ? txData : txData.txs || []
  }, [txData])

  const [decodedTxs, setDecodedTxs] = useState<DecodedTx[]>([])

  useEffect(() => {
    if (transactions.length > 0) {
      const decoded: DecodedTx[] = []

      for (const tx of transactions) {
        try {
          const txData = Tx.decode(tx.tx)
          const msgs: DecodeMsg[] = []

          for (const message of txData.body?.messages || []) {
            try {
              const msg = decodeMsg(message.typeUrl, message.value)
              msgs.push(msg)
            } catch (error) {
              console.warn(`Error decoding message ${message.typeUrl}:`, error)
            }
          }

          decoded.push({ tx, msgs })
        } catch (error) {
          console.error('Error decoding transaction:', error)
        }
      }

      setDecodedTxs(decoded)
    } else {
      setDecodedTxs([])
    }
  }, [transactions])

  return {
    account: account || null,
    balances,
    stakedBalance: stakedBalance || null,
    transactions,
    decodedTxs,
    loading: isAccountLoading,
    error: accountError ? (accountError as Error).message : null,
  }
}
