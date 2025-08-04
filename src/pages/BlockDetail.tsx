import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiHome,
  FiHash,
  FiClock,
  FiActivity,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { getBlock } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { Block, Coin } from '@cosmjs/stargate'
import { Tx as TxData } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { sha256 } from '@cosmjs/crypto'
import { toHex } from '@cosmjs/encoding'
import { timeFromNow, trimHash, displayDate, getTypeMsg } from '@/utils/helper'
import { toast } from 'sonner'

interface Tx {
  data: TxData
  hash: Uint8Array
}

export default function BlockDetail() {
  const { height } = useParams<{ height: string }>()
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [block, setBlock] = useState<Block | null>(null)
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tmClient && height) {
      setLoading(true)
      getBlock(tmClient, parseInt(height, 10))
        .then((blockData) => {
          setBlock(blockData)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching block:', error)
          toast.error('Failed to fetch block data')
          setLoading(false)
        })
    }
  }, [tmClient, height])

  useEffect(() => {
    if (block?.txs.length && !txs.length) {
      const decodedTxs: Tx[] = []
      for (const rawTx of block.txs) {
        try {
          const data = TxData.decode(rawTx)
          const hash = sha256(rawTx)
          decodedTxs.push({ data, hash })
        } catch (error) {
          console.error('Error decoding transaction:', error)
        }
      }
      setTxs(decodedTxs)
    }
  }, [block, txs.length])

  const renderMessages = (messages: any[]) => {
    if (messages.length === 1) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.status.info + '20',
              color: colors.status.info,
            }}
          >
            {getTypeMsg(messages[0].typeUrl)}
          </span>
        </div>
      )
    } else if (messages.length > 1) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.status.info + '20',
              color: colors.status.info,
            }}
          >
            {getTypeMsg(messages[0].typeUrl)}
          </span>
          <span style={{ color: colors.status.info }}>
            +{messages.length - 1}
          </span>
        </div>
      )
    }
    return null
  }

  const getFee = (fees: Coin[] | undefined) => {
    if (fees && fees.length) {
      return (
        <div className="flex items-center gap-2">
          <span style={{ color: colors.text.primary }}>{fees[0].amount}</span>
          <span style={{ color: colors.text.secondary }}>{fees[0].denom}</span>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Block #{height}
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: colors.primary }}
            ></div>
            <p style={{ color: colors.text.secondary }}>
              Loading block data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!block) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Block #{height}
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p style={{ color: colors.text.secondary }}>Block not found</p>
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
          Block #{height}
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
          to="/blocks"
          className="hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          Blocks
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.secondary }}>Block #{height}</span>
      </div>

      {/* Block Header */}
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
          Block Header
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
                  {block.header.chainId}
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
                  {block.header.height}
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
                  Block Time
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {block.header.time
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
                  Block Hash
                </td>
                <td
                  className="py-3 font-mono text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {block.id ? block.id : 'N/A'}
                </td>
              </tr>
              <tr>
                <td
                  className="py-3 px-0 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Transactions
                </td>
                <td className="py-3" style={{ color: colors.text.primary }}>
                  {block.txs.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      {txs.length > 0 && (
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
            Transactions ({txs.length})
          </h2>
          <div
            className="border-b mb-4"
            style={{ borderColor: colors.border.secondary }}
          ></div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: colors.border.secondary }}
                >
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <div className="flex items-center gap-2">
                      <FiHash className="w-4 h-4" />
                      Hash
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <div className="flex items-center gap-2">
                      <FiActivity className="w-4 h-4" />
                      Messages
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-opacity-50 transition-colors duration-200"
                    style={{ borderColor: colors.border.secondary }}
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/txs/${toHex(tx.hash)}`}
                        className="hover:opacity-70 transition-opacity font-mono text-sm"
                        style={{ color: colors.primary }}
                      >
                        {trimHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {renderMessages(tx.data.body?.messages || [])}
                    </td>
                    <td className="py-3 px-4">
                      {getFee(tx.data.authInfo?.fee?.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
