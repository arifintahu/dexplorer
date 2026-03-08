import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { FiBox, FiUsers, FiClock, FiActivity } from 'react-icons/fi'
import { useHomeData } from '@/hooks/useHomeData'
import StatCard from '@/components/Home/StatCard'
import RecentBlocksCard from '@/components/Home/RecentBlocksCard'
import NetworkStatusCard from '@/components/Home/NetworkStatusCard'
import QuickActionsCard from '@/components/Home/QuickActionsCard'

const Home: React.FC = () => {
  const { colors } = useTheme()
  const {
    isConnected,
    isLoading,
    latestBlock,
    totalTransactions,
    blockTime,
    totalActiveValidator,
  } = useHomeData()

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
          subtitle="Currently active"
          iconColor={colors.status.success}
        />
        <StatCard
          title="Total Transactions"
          value={isConnected ? totalTransactions : 'Not Connected'}
          icon={FiActivity}
          subtitle="Transaction count"
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
          <NetworkStatusCard isConnected={isConnected} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  )
}

export default Home
