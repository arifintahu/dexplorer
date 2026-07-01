import React from 'react'
import { FiBox, FiUsers, FiClock, FiActivity } from 'react-icons/fi'
import { useHomeData } from '@/hooks/useHomeData'
import StatCard from '@/components/Home/StatCard'
import RecentBlocksCard from '@/components/Home/RecentBlocksCard'
import QuickActionsCard from '@/components/Home/QuickActionsCard'
import NetworkStatusCard from '@/components/Home/NetworkStatusCard'

const Home: React.FC = () => {
  const {
    isConnected,
    isLoading,
    latestBlock,
    totalTransactions,
    blockTime,
    totalActiveValidator,
    networkStatus,
  } = useHomeData()

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          subtitle="Live block height"
          isLoading={isConnected && latestBlock === null}
          index={0}
        />
        <StatCard
          title="Active Validators"
          value={!isLoading ? totalActiveValidator : 'Loading'}
          icon={FiUsers}
          subtitle="of current validator set"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          title="Total Transactions"
          value={isConnected ? totalTransactions : 'Not Connected'}
          icon={FiActivity}
          subtitle="transaction count"
          isLoading={isConnected && isLoading}
          index={2}
        />
        <StatCard
          title="Block Time"
          value={isConnected ? blockTime : 'Not Connected'}
          icon={FiClock}
          subtitle="avg of recent blocks"
          isLoading={isConnected && isLoading}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <RecentBlocksCard />
        </div>

        <div className="space-y-5">
          <NetworkStatusCard
            isConnected={isConnected}
            catchingUp={networkStatus.catchingUp}
            syncedHeight={networkStatus.blockHeight}
            peers={networkStatus.peers}
            chainId={networkStatus.chainId}
          />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  )
}

export default Home
