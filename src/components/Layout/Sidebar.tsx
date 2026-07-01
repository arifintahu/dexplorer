import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import {
  FiActivity,
  FiBox,
  FiFileText,
  FiGithub,
  FiHome,
  FiLink,
  FiSettings,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { selectBlocks } from '@/store/streamSlice'
import { config } from '@/config'

const navigationGroups = [
  {
    title: 'Network',
    items: [{ name: 'Dashboard', href: '/', icon: FiHome }],
  },
  {
    title: 'Chain Data',
    items: [
      { name: 'Blocks', href: '/blocks', icon: FiBox },
      { name: 'Transactions', href: '/txs', icon: FiActivity },
      { name: 'IBC Transfers', href: '/ibc-transfers', icon: FiLink },
      { name: 'Validators', href: '/validators', icon: FiUsers },
    ],
  },
  {
    title: 'Governance & Accounts',
    items: [
      { name: 'Proposals', href: '/proposals', icon: FiFileText },
      { name: 'Accounts', href: '/accounts', icon: FiUser },
      { name: 'Parameters', href: '/parameters', icon: FiSettings },
    ],
  },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const getConnectionLabel = (address: string) => {
  if (config.chainName) {
    return config.chainName
  }

  if (!address) {
    return 'Not connected'
  }

  try {
    return new URL(address).hostname
  } catch {
    return address
  }
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { colors } = useTheme()
  const location = useLocation()
  const { connectState, rpcAddress } = useSelector(
    (state: RootState) => state.connect
  )
  const blocks = useSelector(selectBlocks)

  const latestHeight = blocks[0]?.header.height
    ? Number(blocks[0].header.height).toLocaleString()
    : '--'
  const chainLabel = getConnectionLabel(rpcAddress)

  const isConnected = connectState

  const handleMobileLinkClick = () => {
    onMobileClose?.()
  }

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col overflow-y-auto border-r px-3 py-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border.primary,
        boxShadow: colors.shadow.sm,
      }}
    >
      <div className="px-3 pb-5 pt-1">
        <div className="flex items-center gap-3">
          <img
            src="/brand-mark.svg"
            alt="Dexplorer logo"
            className="h-10 w-10 shrink-0"
            style={{ filter: `drop-shadow(${colors.shadow.glow})` }}
          />
          <div className="min-w-0">
            <div
              className="truncate font-heading text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              Dexplorer
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: colors.text.tertiary }}
            >
              Cosmos Explorer
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <div
              className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: colors.text.tertiary }}
            >
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileLinkClick}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                      !isActive && 'hover:translate-x-0.5'
                    )}
                    style={{
                      backgroundColor: isActive
                        ? `${colors.primary}18`
                        : 'transparent',
                      border: `1px solid ${
                        isActive ? `${colors.primary}4d` : 'transparent'
                      }`,
                      color: isActive ? colors.primary : colors.text.secondary,
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-auto space-y-3 pt-4">
          <a
            href="https://github.com/arifintahu/dexplorer"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMobileLinkClick}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors"
            style={{
              color: colors.text.secondary,
              border: `1px solid transparent`,
            }}
          >
            <FiGithub className="h-4 w-4 shrink-0" />
            <span>GitHub</span>
          </a>

          <div
            className="rounded-2xl border px-4 py-4"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border.primary,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  isConnected && 'animate-status-pulse'
                )}
                style={{
                  backgroundColor: isConnected
                    ? colors.status.success
                    : colors.status.error,
                }}
              />
              <span
                className="truncate text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                {chainLabel}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: colors.text.tertiary }}>Height</span>
                <span
                  className="font-mono"
                  style={{ color: colors.text.secondary }}
                >
                  {latestHeight}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: colors.text.tertiary }}>Peers</span>
                <span
                  className="font-mono"
                  style={{ color: colors.text.secondary }}
                >
                  {isConnected ? 'Live' : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[236px] transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-[236px]">
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar
