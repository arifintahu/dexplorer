import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeProvider'

const ThemeProbe = () => {
  const { colorScheme, toggleColorScheme } = useTheme()

  useEffect(() => {
    document.body.dataset.scheme = colorScheme
  }, [colorScheme])

  return (
    <button type="button" onClick={toggleColorScheme}>
      toggle theme
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.body.dataset.scheme = ''
  })

  it('publishes the expanded CSS variable set for the active theme', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    const root = document.documentElement

    expect(root.style.getPropertyValue('--color-background-tertiary')).not.toBe(
      ''
    )
    expect(root.style.getPropertyValue('--color-text-tertiary')).not.toBe('')
    expect(root.style.getPropertyValue('--color-border-secondary')).not.toBe('')
    expect(root.style.getPropertyValue('--color-shadow-lg')).not.toBe('')

    await user.click(screen.getByRole('button', { name: /toggle theme/i }))

    expect(document.body.dataset.scheme).toBe('dark')
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.getPropertyValue('--color-background-tertiary')).not.toBe(
      ''
    )
    expect(root.style.getPropertyValue('--color-text-tertiary')).not.toBe('')
  })
})
