import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'

interface QuickActionsCardProps {
  isConnected: boolean
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ isConnected }) => {
  const { colors } = useTheme()
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Search Transaction',
      description: 'Find by hash or address',
      path: '/txs',
    },
    {
      label: 'View Validators',
      description: 'Check validator status',
      path: '/validators',
    },
    {
      label: 'View Proposals',
      description: 'Detailed governance proposals',
      path: '/proposals',
    },
  ]

  return (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg h-full flex flex-col"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <div className="mb-8">
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

      <h3
        className="text-lg font-bold mb-4 tracking-tight"
        style={{ color: colors.text.primary }}
      >
        Quick Actions
      </h3>

      <div className="space-y-3 flex-1">
        {actions.map((action) => (
          <button
            key={action.path}
            className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border.secondary}`,
              color: colors.text.primary,
            }}
            onClick={() => navigate(action.path)}
          >
            <div className="text-sm font-medium">{action.label}</div>
            <div className="text-xs" style={{ color: colors.text.tertiary }}>
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActionsCard
