import React, { useState, useEffect } from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import {
  selectTxEvent,
  selectBlocks,
  selectTotalActiveValidator,
  setTotalActiveValidator,
} from '@/store/streamSlice'
import {
  FiBox,
  FiUsers,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi'
import { formatNumber } from '@/lib/utils'
import { trimHash, timeFromNow } from '@/utils/helper'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import { Link, useNavigate } from 'react-router-dom'
import { selectTmClient } from '@/store/connectSlice'
import { queryActiveValidators } from '@/rpc/abci'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
  isLoading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconColor,
  isLoading = false,
}) => {
  const { colors } = useTheme()
  const cardIconColor = iconColor || colors.primary

  return (
    <div
      className="group rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = colors.shadow.lg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = colors.shadow.sm
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${cardIconColor}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: cardIconColor }} />
            </div>
            <p
              className="text-sm font-medium tracking-wide uppercase"
              style={{ color: colors.text.secondary }}
            >
              {title}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <SkeletonLoader width="120px" height="2.5rem" variant="text" />
              {subtitle && (
                <SkeletonLoader width="80px" height="1rem" variant="text" />
              )}
            </div>
          ) : (
            <>
              <p
                className="text-3xl font-bold mb-2 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                {typeof value === 'number' ? formatNumber(value) : value}
              </p>

              {subtitle && (
                <p
                  className="text-sm mb-2"
                  style={{ color: colors.text.tertiary }}
                >
                  {subtitle}
                </p>
              )}
            </>
          )}

          {trend && !isLoading && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <FiTrendingUp
                  className="h-4 w-4"
                  style={{ color: colors.status.success }}
                />
              ) : (
                <FiTrendingDown
                  className="h-4 w-4"
                  style={{ color: colors.status.error }}
                />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: trend.isPositive
                    ? colors.status.success
                    : colors.status.error,
                }}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs" style={{ color: colors.text.tertiary }}>
                vs last hour
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RecentBlocksCard: React.FC = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const persistentBlocks = useSelector(selectBlocks)
  const [recentBlocks, setRecentBlocks] = useState<any[]>([])

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

const Home: React.FC = () => {
  const { colors } = useTheme()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const tmClient = useSelector(selectTmClient)
  const totalActiveValidator = useSelector(selectTotalActiveValidator)
  const persistentBlocks = useSelector(selectBlocks)
  const txEvent = useSelector(selectTxEvent)
  const isConnected = connectState
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Real blockchain data - get latest block from persistent blocks
  const latestBlock =
    persistentBlocks.length > 0
      ? parseInt(persistentBlocks[0].header.height)
      : null
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [blockTime, setBlockTime] = useState('--')

  // Calculate average block time based on first and most recent blocks
  useEffect(() => {
    if (persistentBlocks.length >= 2) {
      const recentBlock = persistentBlocks[0] // Most recent block
      const firstBlock = persistentBlocks[persistentBlocks.length - 1] // Oldest block in the array

      const recentHeight = parseInt(recentBlock.header.height)
      const firstHeight = parseInt(firstBlock.header.height)
      const recentTime = new Date(recentBlock.header.time).getTime()
      const firstTime = new Date(firstBlock.header.time).getTime()

      const heightDiff = recentHeight - firstHeight
      const timeDiff = (recentTime - firstTime) / 1000 // Convert to seconds

      if (heightDiff > 0) {
        const avgBlockTime = timeDiff / heightDiff
        setBlockTime(`${avgBlockTime.toFixed(1)}s`)
      }
    } else if (persistentBlocks.length === 1) {
      // Fallback to default when only one block is available
      setBlockTime('--')
    }
  }, [persistentBlocks])

  // Count transactions
  useEffect(() => {
    if (txEvent) {
      setTotalTransactions((prev) => prev + 1)
    }
  }, [txEvent])

  useEffect(() => {
    if (tmClient && totalActiveValidator === 0) {
      setIsLoading(true)
      queryActiveValidators(tmClient, 0, 10)
        .then((response) => {
          dispatch(setTotalActiveValidator(Number(response.pagination?.total)))
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch validators:', error)
          setIsLoading(false)
        })
    } else if (totalActiveValidator > 0) {
      setIsLoading(false)
    }
  }, [tmClient, totalActiveValidator, dispatch])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: colors.text.primary }}
        >
          Dexplorer Dashboard
        </h1>
        <p className="text-lg" style={{ color: colors.text.secondary }}>
          Real-time insights into the blockchain network
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Latest Block"
          value={
            isConnected
              ? latestBlock !== null
                ? latestBlock
                : ''
              : 'Not Connected'
          }
          icon={FiBox}
          subtitle="Current height"
          iconColor={colors.status.info}
          isLoading={isConnected && latestBlock === null}
        />
        <StatCard
          title="Active Validators"
          value={!isLoading ? totalActiveValidator : 'Loading'}
          icon={FiUsers}
          subtitle="Currently online"
          iconColor={colors.status.success}
        />
        <StatCard
          title="Total Transactions"
          value={isConnected ? totalTransactions : 'Not Connected'}
          icon={FiActivity}
          subtitle="Session count"
          iconColor={colors.status.warning}
        />
        <StatCard
          title="Block Time"
          value={isConnected ? blockTime : 'Not Connected'}
          icon={FiClock}
          subtitle="Latest interval"
          iconColor={colors.status.error}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentBlocksCard />
        </div>

        <div className="space-y-6">
          {/* Network Status Card */}
          <div
            className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border.primary}`,
              boxShadow: colors.shadow.sm,
            }}
          >
            <h3
              className="text-lg font-bold mb-4 tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Network Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Network Health
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isConnected
                        ? colors.status.success
                        : colors.status.error,
                    }}
                  ></div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isConnected
                        ? colors.status.success
                        : colors.status.error,
                    }}
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Consensus
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {isConnected ? '99.8%' : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Uptime
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {isConnected ? '99.9%' : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div
            className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border.primary}`,
              boxShadow: colors.shadow.sm,
            }}
          >
            <h3
              className="text-lg font-bold mb-4 tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                  color: colors.text.primary,
                }}
                onClick={() => navigate('/txs')}
              >
                <div className="text-sm font-medium">Search Transaction</div>
                <div
                  className="text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  Find by hash or address
                </div>
              </button>

              <button
                className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                  color: colors.text.primary,
                }}
                onClick={() => navigate('/validators')}
              >
                <div className="text-sm font-medium">View Validators</div>
                <div
                  className="text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  Check validator status
                </div>
              </button>

              <button
                className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border.secondary}`,
                  color: colors.text.primary,
                }}
                onClick={() => navigate('/proposals')}
              >
                <div className="text-sm font-medium">View Proposals</div>
                <div
                  className="text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  Detailed governance proposals
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
