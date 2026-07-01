import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NewBlockEvent } from '@cosmjs/tendermint-rpc'
import { toHex } from '@cosmjs/encoding'
import { FiHash } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { selectBlocks, selectNewBlock } from '@/store/streamSlice'
import { timeFromNow, trimHash } from '@/utils/helper'
import CopyText from '@/components/ui/CopyText'

const MAX_ROWS = 50

interface SerializableBlock {
  header: {
    height: string
    time: string
    appHash: string
    proposerAddress: string
    [key: string]: unknown
  }
  txs: unknown[]
}

type BlockType = NewBlockEvent | SerializableBlock

const Blocks: React.FC = () => {
  const { colors } = useTheme()
  const newBlock = useSelector(selectNewBlock)
  const persistentBlocks = useSelector(selectBlocks)
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [announcement, setAnnouncement] = useState('')

  const initialBlocks = useMemo(
    () =>
      persistentBlocks.length > 0 ? persistentBlocks.slice(0, MAX_ROWS) : [],
    [persistentBlocks]
  )

  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  useEffect(() => {
    if (!newBlock) return

    setBlocks((currentBlocks) => {
      if (!currentBlocks.length) {
        return [newBlock]
      }

      return newBlock.header.height > getBlockHeight(currentBlocks[0])
        ? [newBlock, ...currentBlocks.slice(0, MAX_ROWS - 1)]
        : currentBlocks
    })
  }, [newBlock])

  useEffect(() => {
    if (!newBlock) return

    setAnnouncement((current) => {
      const height = getBlockHeight(newBlock)
      const nextText = `New block ${height.toLocaleString()} added`
      return current === nextText ? current : nextText
    })
  }, [newBlock])

  const getBlockHeight = (block: BlockType): number =>
    typeof block.header.height === 'string'
      ? parseInt(block.header.height)
      : block.header.height

  const getBlockTime = (block: BlockType): string =>
    typeof block.header.time === 'string'
      ? block.header.time
      : block.header.time.toISOString()

  return (
    <div className="space-y-5">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <div className="reference-table-shell">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.primary }}
              >
                <th className="reference-table-header px-5 py-4 text-left">
                  Height
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Block Hash
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Proposer
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Txns
                </th>
                <th className="reference-table-header px-5 py-4 text-left">
                  Gas
                </th>
                <th className="reference-table-header px-5 py-4 text-right">
                  Age
                </th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, index) => {
                const proposerAddress =
                  typeof block.header.proposerAddress === 'string'
                    ? block.header.proposerAddress
                    : toHex(block.header.proposerAddress)
                const proposerDisplay = trimHash(proposerAddress, 8)
                const appHash =
                  typeof block.header.appHash === 'string'
                    ? block.header.appHash
                    : toHex(block.header.appHash)

                return (
                  <tr
                    key={`${block.header.height}-${index}`}
                    className="reference-table-row border-b"
                    style={{ borderColor: colors.border.primary }}
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/blocks/${getBlockHeight(block)}`}
                        className="font-mono text-[1.05rem] font-semibold hover:opacity-70 transition-opacity"
                        style={{ color: colors.primary }}
                      >
                        {getBlockHeight(block).toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <CopyText
                        text={appHash}
                        displayText={trimHash(appHash, 16)}
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-semibold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                          }}
                        >
                          {proposerDisplay.charAt(0) || '?'}
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {proposerDisplay}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: colors.text.primary }}>
                        {block.txs.length}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: colors.text.tertiary }}
                    >
                      --
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {timeFromNow(getBlockTime(block))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {blocks.length === 0 && (
            <div className="py-12 text-center">
              <FiHash
                className="mx-auto mb-4 h-12 w-12 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No blocks available
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: colors.text.tertiary }}
              >
                Blocks will appear here when the connection is established
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Blocks
