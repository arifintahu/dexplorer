import { useEffect, useState } from 'react'
import { Account, Coin } from '@cosmjs/stargate'
import { TxResponse } from '@cosmjs/tendermint-rpc'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { toast } from 'sonner'
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
  const [account, setAccount] = useState<Account | null>(null)
  const [balances, setBalances] = useState<Coin[]>([])
  const [stakedBalance, setStakedBalance] = useState<Coin | null>(null)
  const [transactions, setTransactions] = useState<TxResponse[]>([])
  const [decodedTxs, setDecodedTxs] = useState<DecodedTx[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tmClient && address) {
      setLoading(true)
      setError(null)
      
      Promise.all([
        getAccount(tmClient, address).catch((err) => {
          console.error('Failed to fetch account:', err)
          return null
        }),
        getAllBalances(tmClient, address).catch((err) => {
          console.error('Failed to fetch balances:', err)
          return []
        }),
        getBalanceStaked(tmClient, address).catch((err) => {
          // It's common for accounts to not have staked balance or for the query to fail if module not supported
          console.warn('Failed to fetch staked balance:', err)
          return null
        }),
        getTxsBySender(tmClient, address, 1, 10).catch((err) => {
          console.error('Failed to fetch transactions:', err)
          return { txs: [], totalCount: 0 }
        }),
      ])
        .then(([accountData, balanceData, stakedData, txData]) => {
          setAccount(accountData)
          setBalances([...balanceData])
          setStakedBalance(stakedData)
          // Handle both TxSearchResponse structure and direct array if API differs
          const txs = Array.isArray(txData) ? txData : (txData.txs || [])
          setTransactions([...txs])
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching account data:', error)
          setError('Failed to fetch account data')
          toast.error('Failed to fetch account data')
          setLoading(false)
        })
    }
  }, [tmClient, address])

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
    account,
    balances,
    stakedBalance,
    transactions,
    decodedTxs,
    loading,
    error,
  }
}
