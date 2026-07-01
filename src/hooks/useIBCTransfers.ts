import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTransactions } from '@/store/streamSlice'
import { useClientStore } from '@/store/clientStore'

export interface IBCTransfer {
  hash: string
  height: string
  timestamp: string
  sender: string
  receiver: string
  sourceChannel: string
  sourcePort: string
  destinationChannel: string
  destinationPort: string
  amount: string
  denom: string
  memo: string
  status: 'success' | 'failed'
}

export const useIBCTransfers = () => {
  const transactions = useSelector(selectTransactions)
  const tmClient = useClientStore((state) => state.tmClient)

  const [ibcTransfers, setIbcTransfers] = useState<IBCTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!tmClient) return

    setIsLoading(true)

    // Defer processing so isLoading renders before blocking
    const timer = setTimeout(() => {
      // Filter transactions that contain IBC transfers
      const transfers: IBCTransfer[] = []

      for (const tx of transactions) {
        try {
          // Check for failed status
          const isSuccess = tx.result.code === 0

          // Look for IBC transfer events
          const events = tx.result.events || []
          let sender = ''
          let receiver = ''
          let sourceChannel = ''
          let sourcePort = ''
          let destinationChannel = ''
          let destinationPort = ''
          let amount = ''
          let denom = ''
          let memo = ''

          // Channel/port routing data lives on the packet lifecycle events
          // (send_packet on the source chain, acknowledge_packet once the
          // ack lands back, recv_packet/timeout_packet on other legs), all
          // keyed with a "packet_" prefix. Confirmed against live chain data.
          for (const event of events) {
            if (
              event.type === 'send_packet' ||
              event.type === 'recv_packet' ||
              event.type === 'acknowledge_packet' ||
              event.type === 'timeout_packet' ||
              event.type === 'write_acknowledgement'
            ) {
              for (const attr of event.attributes) {
                if (attr.key === 'packet_src_channel')
                  sourceChannel = attr.value
                if (attr.key === 'packet_src_port') sourcePort = attr.value
                if (attr.key === 'packet_dst_channel')
                  destinationChannel = attr.value
                if (attr.key === 'packet_dst_port') destinationPort = attr.value
              }
            }

            // Sender/receiver/denom/amount/memo live as separate attributes
            // on fungible_token_packet (relayed transfers) or ibc_transfer
            // (locally-initiated transfers). Confirmed against live chain
            // data — these are NOT concatenated Coin strings here.
            if (
              event.type === 'fungible_token_packet' ||
              event.type === 'ibc_transfer'
            ) {
              for (const attr of event.attributes) {
                if (attr.key === 'sender') sender = attr.value
                if (attr.key === 'receiver') receiver = attr.value
                if (attr.key === 'denom') denom = attr.value
                if (attr.key === 'amount') amount = attr.value
                if (attr.key === 'memo') memo = attr.value
              }
            }
          }

          // Fallback: if we picked up an amount but never found a separate
          // denom attribute, the amount may be a combined Coin string like
          // "73325uosmo" — split the leading digit run from the denom.
          if (amount && !denom) {
            const match = amount.match(/^(\d+)(.+)$/)
            if (match) {
              amount = match[1]
              denom = match[2]
            }
          }

          // If we have IBC transfer data, this is an IBC transaction
          if (sourceChannel || sourcePort || sender || receiver) {
            transfers.push({
              hash: tx.hash,
              height: tx.height,
              timestamp: tx.timestamp,
              sender,
              receiver,
              sourceChannel,
              sourcePort,
              destinationChannel,
              destinationPort,
              amount,
              denom,
              memo,
              status: isSuccess ? 'success' : 'failed',
            })
          }
        } catch (error) {
          console.warn('Error parsing IBC transfer:', error)
        }
      }

      // Sort by height descending
      transfers.sort((a, b) => parseInt(b.height) - parseInt(a.height))

      setIbcTransfers(transfers.slice(0, 100)) // Limit to 100 most recent
      setIsLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [transactions, tmClient])

  return {
    ibcTransfers,
    isLoading,
    hasTransfers: ibcTransfers.length > 0,
  }
}
