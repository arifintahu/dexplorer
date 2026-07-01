import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { FiActivity, FiBox, FiFileText, FiUsers } from 'react-icons/fi'

const QuickActionsCard: React.FC = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Blocks',
      path: '/blocks',
      icon: FiBox,
      tint: colors.primary,
    },
    {
      label: 'Txns',
      path: '/txs',
      icon: FiActivity,
      tint: colors.status.info,
    },
    {
      label: 'Validators',
      path: '/validators',
      icon: FiUsers,
      tint: colors.status.success,
    },
    {
      label: 'Proposals',
      path: '/proposals',
      icon: FiFileText,
      tint: colors.status.warning,
    },
  ]

  return (
    <div className="panel-surface rounded-[14px] p-5">
      <h3
        className="mb-6 text-[1.05rem] font-semibold tracking-tight"
        style={{ color: colors.text.primary }}
      >
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            className="w-full rounded-[10px] border px-4 py-[11px] text-left transition-all duration-200 hover:opacity-85"
            style={{
              backgroundColor: colors.backgroundSecondary,
              border: `1px solid ${colors.border.primary}`,
              color: colors.text.primary,
            }}
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-center gap-2">
              <action.icon className="h-4 w-4" style={{ color: action.tint }} />
              <div className="text-sm font-medium">{action.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActionsCard
