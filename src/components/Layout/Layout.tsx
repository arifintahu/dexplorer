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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors.background }}
    >
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 pl-0 lg:pl-60 transition-all duration-300">
        {/* Top Navigation */}
        <TopNavigation onMenuClick={toggleMobileSidebar} />

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default Layout
