import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'

interface NetworkStatusCardProps {
  isConnected: boolean
}

const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({ isConnected }) => {
  const { colors } = useTheme()

  return (
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
  )
}

export default NetworkStatusCard
