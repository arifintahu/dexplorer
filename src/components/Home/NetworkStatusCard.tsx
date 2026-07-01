import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { FiRefreshCw } from 'react-icons/fi'

interface NetworkStatusCardProps {
  isConnected: boolean
  catchingUp?: boolean
  syncedHeight?: number
  peers?: number
  chainId?: string
}

const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({
  isConnected,
  catchingUp = false,
  syncedHeight = 0,
  peers = 0,
  chainId = '',
}) => {
  const { colors } = useTheme()

  return (
    <div className="panel-surface rounded-[14px] p-5">
      <h3
        className="mb-6 text-[1.05rem] font-semibold tracking-tight"
        style={{ color: colors.text.primary }}
      >
        Network Status
      </h3>

      <div className="space-y-[0.95rem]">
        {/* Network Health / Sync Status */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Sync status
          </span>
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: !isConnected
                  ? colors.status.error
                  : catchingUp
                    ? colors.status.warning
                    : colors.status.success,
              }}
            ></div>
            <span
              className="text-sm font-semibold"
              style={{
                color: !isConnected
                  ? colors.status.error
                  : catchingUp
                    ? colors.status.warning
                    : colors.status.success,
              }}
            >
              {!isConnected
                ? 'Disconnected'
                : catchingUp
                  ? 'Syncing...'
                  : 'Synced'}
            </span>
          </div>
        </div>

        {/* Block Height */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Synced height
          </span>
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: colors.text.primary }}
          >
            {isConnected ? syncedHeight.toLocaleString() : 'N/A'}
          </span>
        </div>

        {/* Connected Peers */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Connected peers
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            {isConnected ? peers : 'N/A'}
          </span>
        </div>

        {/* Chain ID */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Chain ID
          </span>
          <span
            className="max-w-[180px] truncate text-xs font-mono"
            style={{ color: colors.text.tertiary }}
            title={isConnected ? chainId : undefined}
          >
            {isConnected && chainId ? chainId : 'N/A'}
          </span>
        </div>

        {isConnected && (
          <div
            className="flex items-center gap-2 border-t pt-4"
            style={{ borderColor: colors.border.secondary }}
          >
            <FiRefreshCw
              className="h-4 w-4"
              style={{ color: colors.status.success }}
            />
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              {catchingUp
                ? 'Catching up to consensus'
                : 'Participating in consensus'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NetworkStatusCard
