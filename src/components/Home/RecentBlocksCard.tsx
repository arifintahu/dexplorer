import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { selectBlocks } from '@/store/streamSlice'
import { trimHash, timeFromNow } from '@/utils/helper'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

interface FormattedBlock {
  height: number
  hash: string
  time: string
  txCount: number
  proposer: string
}

const RecentBlocksCard: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const persistentBlocks = useSelector(selectBlocks)
  const [recentBlocks, setRecentBlocks] = useState<FormattedBlock[]>([])

  // Update recent blocks from persistent store
  useEffect(() => {
    if (persistentBlocks.length > 0) {
      const formattedBlocks = persistentBlocks.slice(0, 6).map((block) => ({
        height: parseInt(block.header.height),
        hash: trimHash(block.header.appHash || '', 16),
        time: timeFromNow(block.header.time),
        txCount: block.txs?.length || 0,
        proposer: trimHash(block.header.proposerAddress || '', 10),
      }))

      setRecentBlocks(formattedBlocks)
    }
  }, [persistentBlocks])

  return (
    <div className="reference-table-shell">
      <div
        className="flex items-center justify-between border-b px-5 py-5"
        style={{ borderColor: colors.border.primary }}
      >
        <h3
          className="text-[1.05rem] font-semibold tracking-tight"
          style={{ color: colors.text.primary }}
        >
          Latest Blocks
        </h3>
        <Link
          to="/blocks"
          className="text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: colors.primary }}
        >
          View all →
        </Link>
      </div>

      <div>
        <AnimatePresence mode="popLayout">
          {recentBlocks.length > 0
            ? recentBlocks.map((block, index) => (
                <motion.div
                  key={block.height}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  role="button"
                  tabIndex={0}
                  className="reference-table-row grid cursor-pointer gap-3 border-b px-5 py-4 md:grid-cols-[96px_minmax(0,1fr)_130px_70px] md:items-center"
                  style={{
                    borderColor: colors.border.primary,
                  }}
                  onClick={() => navigate(`/blocks/${block.height}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/blocks/${block.height}`)
                    }
                  }}
                >
                  <span
                    className="font-mono text-[0.95rem] font-medium"
                    style={{ color: colors.primary }}
                  >
                    {block.height.toLocaleString()}
                  </span>
                  <span
                    className="truncate font-mono text-[0.8rem]"
                    style={{ color: colors.text.tertiary }}
                  >
                    {block.hash}
                  </span>
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                      }}
                    >
                      {block.proposer.slice(0, 1).toUpperCase()}
                    </div>
                    <span
                      className="truncate text-[0.8rem]"
                      style={{ color: colors.text.secondary }}
                    >
                      {block.proposer}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[0.8rem] font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {block.txCount} txns
                    </div>
                    <span
                      className="text-[0.7rem] font-medium"
                      style={{ color: colors.text.tertiary }}
                    >
                      {block.time}
                    </span>
                  </div>
                </motion.div>
              ))
            : // Skeleton loading for blocks
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="border-b px-5 py-5"
                  style={{ borderColor: colors.border.primary }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <SkeletonLoader
                          width="32px"
                          height="32px"
                          variant="rectangular"
                        />
                        <div className="space-y-2">
                          <SkeletonLoader
                            width="120px"
                            height="1rem"
                            variant="text"
                          />
                          <div className="flex items-center gap-2">
                            <SkeletonLoader
                              width="60px"
                              height="0.75rem"
                              variant="text"
                            />
                            <SkeletonLoader
                              width="80px"
                              height="0.75rem"
                              variant="text"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pl-11">
                        <SkeletonLoader
                          width="200px"
                          height="0.75rem"
                          variant="text"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <SkeletonLoader
                        width="60px"
                        height="0.75rem"
                        variant="text"
                      />
                    </div>
                  </div>
                </div>
              ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

export default RecentBlocksCard
