import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/ThemeProvider'
import { FiInbox } from 'react-icons/fi'

// Empty component
export default function Empty() {
  const { colors } = useTheme()

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center flex-col gap-3 p-8'
      )}
    >
      <FiInbox
        className="w-12 h-12 opacity-50"
        style={{ color: colors.text.tertiary }}
      />
      <div className="text-center">
        <p
          className="text-lg font-medium"
          style={{ color: colors.text.secondary }}
        >
          No data available
        </p>
        <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
          Data will appear here when available
        </p>
      </div>
    </div>
  )
}
