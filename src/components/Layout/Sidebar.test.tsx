import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { store } from '@/store'
import { ThemeProvider } from '@/theme/ThemeProvider'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('renders the grouped navigation with footer link and network summary labels', () => {
    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )

    expect(screen.getAllByText('Network').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chain Data').length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: /github/i }).length
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Height').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Peers').length).toBeGreaterThan(0)
  })
})
