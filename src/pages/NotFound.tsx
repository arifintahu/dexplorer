import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiAlertCircle } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'

const NotFound: React.FC = () => {
  const { colors } = useTheme()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <FiAlertCircle
        className="w-24 h-24 mb-6 opacity-50"
        style={{ color: colors.text.tertiary }}
      />
      <h1
        className="text-4xl font-bold mb-4"
        style={{ color: colors.text.primary }}
      >
        404 - Page Not Found
      </h1>
      <p
        className="text-lg mb-8 max-w-md"
        style={{ color: colors.text.secondary }}
      >
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-90"
        style={{
          backgroundColor: colors.primary,
          color: '#ffffff',
        }}
      >
        <FiHome className="w-5 h-5" />
        Return Home
      </Link>
    </div>
  )
}

export default NotFound
