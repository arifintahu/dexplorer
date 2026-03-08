import React, { useState, useEffect } from 'react'
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
  validator: string
}

const RecentBlocksCard: React.FC = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const persistentBlocks = useSelector(selectBlocks)
  const [recentBlocks, setRecentBlocks] = useState<FormattedBlock[]>([])

  // Update recent blocks from persistent store
  useEffect(() => {
    if (persistentBlocks.length > 0) {
      const formattedBlocks = persistentBlocks.slice(0, 4).map((block) => ({
        height: parseInt(block.header.height),
        hash: trimHash(block.header.appHash || '', 16),
        time: timeFromNow(block.header.time),
        txCount: block.txs?.length || 0,
        validator: trimHash(block.header.proposerAddress || '', 8),
      }))

      setRecentBlocks(formattedBlocks)
    }
  }, [persistentBlocks])

  return (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl font-bold tracking-tight"
          style={{ color: colors.text.primary }}
        >
          Recent Blocks
        </h3>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${colors.status.success}15`,
            color: colors.status.success,
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: colors.status.success }}
          ></div>
          Live
        </div>
      </div>

      <div className="space-y-3">
        {recentBlocks.length > 0
          ? recentBlocks.map((block, index) => (
              <div
                key={block.height}
                className="group flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                }}
                onClick={() => navigate(`/blocks/${block.height}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.primary}08`
                  e.currentTarget.style.borderColor = `${colors.primary}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background
                  e.currentTarget.style.borderColor = colors.border.secondary
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        Block #{block.height.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: `${colors.status.info}20`,
                            color: colors.status.info,
                          }}
                        >
                          {block.txCount} txs
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          by {block.validator}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-xs font-mono pl-11 group-hover:text-opacity-80 transition-all duration-200"
                    style={{ color: colors.text.secondary }}
                  >
                    {block.hash}...
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-medium"
                    style={{ color: colors.text.tertiary }}
                  >
                    {block.time}
                  </span>
                </div>
              </div>
            ))
          : // Skeleton loading for blocks
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                }}
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
      </div>

      <Link
        to="/blocks"
        className="block w-full mt-6 py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: colors.primary,
          color: colors.background,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${colors.primary}dd`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary
        }}
      >
        View All Blocks →
      </Link>
    </div>
  )
}

export default RecentBlocksCard
