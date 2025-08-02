import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiChevronRight, FiHome, FiHash, FiCheck, FiX } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { getTx, getBlock } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { IndexedTx, Block, Coin } from '@cosmjs/stargate'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import {
  timeFromNow,
  displayDate,
  isBech32Address,
  getTypeMsg,
} from '@/utils/helper'
import { decodeMsg, DecodeMsg } from '@/encoding'
import { toast } from 'sonner'
import CodeBlock from '@/components/CodeBlock'

export default function TransactionDetail() {
  const { hash } = useParams<{ hash: string }>()
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [tx, setTx] = useState<IndexedTx | null>(null)
  const [txData, setTxData] = useState<Tx | null>(null)
  const [block, setBlock] = useState<Block | null>(null)
  const [msgs, setMsgs] = useState<DecodeMsg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tmClient && hash) {
      setLoading(true)
      getTx(tmClient, hash)
        .then((txResult) => {
          setTx(txResult)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching transaction:', error)
          toast.error('Failed to fetch transaction data')
          setLoading(false)
        })
    }
  }, [tmClient, hash])

  useEffect(() => {
    if (tmClient && tx?.height) {
      getBlock(tmClient, tx.height)
        .then(setBlock)
        .catch((error) => {
          console.error('Error fetching block:', error)
        })
    }
  }, [tmClient, tx])

  useEffect(() => {
    if (tx?.tx) {
      try {
        const data = Tx.decode(tx.tx)
        setTxData(data)
      } catch (error) {
        console.error('Error decoding transaction:', error)
      }
    }
  }, [tx])

  useEffect(() => {
    if (txData?.body?.messages.length && !msgs.length) {
      const decodedMsgs: DecodeMsg[] = []
      for (const message of txData.body.messages) {
        try {
          const msg = decodeMsg(message.typeUrl, message.value)
          decodedMsgs.push(msg)
        } catch (error) {
          console.error('Error decoding message:', error)
        }
      }
      setMsgs(decodedMsgs)
    }
  }, [txData, msgs.length])

  const getFee = (fees: Coin[] | undefined) => {
    if (fees && fees.length) {
      return (
        <div className="flex items-center gap-2">
          <span style={{ color: colors.text.primary }}>{fees[0].amount}</span>
          <span style={{ color: colors.text.secondary }}>{fees[0].denom}</span>
        </div>
      )
    }
    return 'N/A'
  }

  const showMsgData = (msgData: any) => {
    if (msgData) {
      if (Array.isArray(msgData)) {
        const data = JSON.stringify(msgData, null, 2)
        return <CodeBlock language="json" codeString={data} />
      }

      if (!Array.isArray(msgData) && msgData.length) {
        if (isBech32Address(msgData)) {
          return (
            <Link
              to={`/accounts/${msgData}`}
              className="hover:opacity-70 transition-opacity"
              style={{ color: colors.primary }}
            >
              {msgData}
            </Link>
          )
        } else {
          return String(msgData)
        }
      }
    }
    return ''
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Transaction
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: colors.primary }}
            ></div>
            <p style={{ color: colors.text.secondary }}>
              Loading transaction data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Transaction
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p style={{ color: colors.text.secondary }}>
              Transaction not found
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Transaction
        </h1>
        <div
          className="h-4 w-px"
          style={{ backgroundColor: colors.border.primary }}
        ></div>
        <Link
          to="/"
          className="flex items-center hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          <FiHome className="w-4 h-4" />
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <Link
          to="/txs"
          className="hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          Transactions
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.secondary }}>Transaction</span>
      </div>

      {/* Transaction Information */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: colors.text.primary }}
        >
          Transaction Information
        </h2>
        <div
          className="border-b mb-4"
          style={{ borderColor: colors.border.secondary }}
        ></div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary, width: '150px' }}
                >
                  Chain ID
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {block?.header.chainId || 'N/A'}
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Hash
                </td>
                <td
                  className="py-3 font-mono text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {hash}
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Height
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  <Link
                    to={`/blocks/${tx.height}`}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: colors.primary }}
                  >
                    {tx.height}
                  </Link>
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Status
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {tx.code === 0 ? (
                      <>
                        <FiCheck
                          className="w-4 h-4"
                          style={{ color: colors.status.success }}
                        />
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colors.status.success + '20',
                            color: colors.status.success,
                          }}
                        >
                          Success
                        </span>
                      </>
                    ) : (
                      <>
                        <FiX
                          className="w-4 h-4"
                          style={{ color: colors.status.error }}
                        />
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colors.status.error + '20',
                            color: colors.status.error,
                          }}
                        >
                          Failed
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Time
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {block?.header.time
                    ? `${timeFromNow(block.header.time)} (${displayDate(
                        block.header.time
                      )})`
                    : 'N/A'}
                </td>
              </tr>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Fee
                </td>
                <td className="py-3">
                  {getFee(txData?.authInfo?.fee?.amount)}
                </td>
              </tr>
              <tr>
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Gas Used
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {tx.gasUsed?.toLocaleString() || 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Messages */}
      {msgs.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Messages ({msgs.length})
          </h2>
          <div
            className="border-b mb-4"
            style={{ borderColor: colors.border.secondary }}
          ></div>

          <div className="space-y-4">
            {msgs.map((msg, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: colors.status.info + '20',
                      color: colors.status.info,
                    }}
                  >
                    {getTypeMsg(msg.typeUrl)}
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(msg.data || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text.secondary }}
                      >
                        {key}:
                      </span>
                      <div
                        className="text-sm"
                        style={{ color: colors.text.primary }}
                      >
                        {showMsgData(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
