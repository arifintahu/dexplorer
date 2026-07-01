import React, { useState } from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colors } = useTheme()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg px-4 py-3 font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        style={{
          backgroundColor: colors.surface,
          color: colors.text.primary,
          border: `1px solid ${colors.border.focus}`,
          boxShadow: colors.shadow.lg,
        }}
      >
        Skip to main content
      </a>

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen lg:pl-[236px]"
      >
        <TopNavigation onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <div className="px-4 pb-10 pt-5 lg:px-7">
          <div className="mx-auto max-w-[1320px]">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default Layout
