import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import {
  FiChevronRight,
  FiHome,
  FiClock,
  FiHash,
  FiActivity,
} from 'react-icons/fi'
import {
  selectNewBlock,
  selectTxEvent,
  selectBlocks,
  selectTransactions,
} from '@/store/streamSlice'
import { toHex } from '@cosmjs/encoding'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { timeFromNow, trimHash, getTypeMsg } from '@/utils/helper'
import { useTheme } from '@/theme/ThemeProvider'

const MAX_ROWS = 50

interface Tx {
  TxEvent: TxEvent
  Timestamp: Date
}

interface SerializableBlock {
  header: {
    height: string
    time: string
    appHash: string
    proposerAddress: string
    [key: string]: any
  }
  txs: any[]
}

type BlockType = NewBlockEvent | SerializableBlock

const Blocks: React.FC = () => {
  const { colors } = useTheme()
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const persistentBlocks = useSelector(selectBlocks)
  const persistentTxs = useSelector(selectTransactions)
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [txs, setTxs] = useState<Tx[]>([])

  // Initialize blocks from persistent store with memoization
  const initialBlocks = useMemo(() => {
    return persistentBlocks.length > 0
      ? persistentBlocks.slice(0, MAX_ROWS)
      : []
  }, [persistentBlocks.length])

  // Initialize txs from persistent store with memoization
  const initialTxs = useMemo(() => {
    return persistentTxs.length > 0 ? persistentTxs.slice(0, MAX_ROWS) : []
  }, [persistentTxs.length])

  // Set initial data only when length changes (not on every block update)
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  useEffect(() => {
    setTxs(initialTxs)
  }, [initialTxs])

  useEffect(() => {
    if (newBlock) {
      updateBlocks(newBlock)
    }
  }, [newBlock])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  const getBlockHeight = (block: BlockType): number => {
    return typeof block.header.height === 'string'
      ? parseInt(block.header.height)
      : block.header.height
  }

  const getBlockTime = (block: BlockType): string => {
    if (typeof block.header.time === 'string') {
      return block.header.time
    }
    return block.header.time.toISOString()
  }

  const updateBlocks = (block: NewBlockEvent) => {
    if (blocks.length) {
      if (block.header.height > getBlockHeight(blocks[0])) {
        setBlocks((prevBlocks) => [block, ...prevBlocks.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setBlocks([block])
    }
  }

  const updateTxs = (txEvent: TxEvent) => {
    const tx = {
      TxEvent: txEvent,
      Timestamp: new Date(),
    }
    if (txs.length) {
      if (
        txEvent.height >= txs[0].TxEvent.height &&
        txEvent.hash != txs[0].TxEvent.hash
      ) {
        setTxs((prevTx) => [tx, ...prevTx.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setTxs([tx])
    }
  }

  // Memoize message rendering to avoid expensive decoding on every render
  const renderMessages = useCallback(
    (data: Uint8Array | undefined) => {
      if (!data) return ''

      try {
        const txBody = TxBody.decode(data)
        const messages = txBody.messages

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
      } catch (error) {
        console.warn('Failed to decode transaction data:', error)
      }
      return ''
    },
    [colors.status.info]
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Blocks
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
        <span style={{ color: colors.text.secondary }}>Blocks</span>
      </div>

      {/* Main Content */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        {/* Blocks Content */}
        {
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
                      Height
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    App Hash
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <div className="flex items-center gap-2">
                      <FiActivity className="w-4 h-4" />
                      Txs
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      Time
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block, index) => (
                  <tr
                    key={`${block.header.height}-${index}`}
                    className="border-b hover:bg-opacity-50 transition-colors duration-200"
                    style={{
                      borderColor: colors.border.secondary,
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.background + '50'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/blocks/${getBlockHeight(block)}`}
                        className="hover:opacity-70 transition-opacity font-mono"
                        style={{ color: colors.primary }}
                      >
                        {getBlockHeight(block)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="font-mono text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {trimHash(
                          typeof block.header.appHash === 'string'
                            ? block.header.appHash
                            : toHex(block.header.appHash)
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.text.primary }}>
                        {block.txs.length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {timeFromNow(getBlockTime(block))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {blocks.length === 0 && (
              <div className="text-center py-12">
                <FiHash
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  style={{ color: colors.text.tertiary }}
                />
                <p style={{ color: colors.text.secondary }}>
                  No blocks available
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.tertiary }}
                >
                  Blocks will appear here when the connection is established
                </p>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  )
}

export default Blocks
