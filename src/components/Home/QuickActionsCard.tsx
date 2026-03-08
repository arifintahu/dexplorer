import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'

const QuickActionsCard: React.FC = () => {
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
