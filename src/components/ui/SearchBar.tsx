import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiLoader } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'

interface SearchBarProps {
  placeholder: string
  basePath: string
  validateInput?: (input: string) => boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  basePath,
  validateInput = () => true,
}) => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !validateInput(query)) return

    setIsSearching(true)
    // Small delay to show feedback, but not 1s
    setTimeout(() => {
      setIsSearching(false)
      navigate(`${basePath}/${query.trim()}`)
    }, 300)
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-11 rounded-lg border focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border.secondary,
            color: colors.text.primary,
            boxShadow: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary
            e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border.secondary
            e.target.style.boxShadow = 'none'
          }}
        />
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: colors.text.tertiary }}
        >
          {isSearching ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiSearch className="w-5 h-5" />
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: colors.primary,
            color: '#ffffff',
          }}
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
