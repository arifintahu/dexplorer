import { render, screen } from '@testing-library/react'
import App from './App'
import { store } from '@/store'
import { setConnectState, setRPCAddress } from '@/store/connectSlice'

// Force normal (non-bypass) mode regardless of local RPC_ADDRESS/.env.local
// config on the developer's machine, so this test is deterministic.
vi.mock('@/config', () => ({
  config: { rpcAddress: '', chainName: '', isBypassMode: false },
}))

describe('App disconnected shell', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    store.dispatch(setConnectState(false))
    store.dispatch(setRPCAddress(''))
  })

  it('renders the connect experience inside the app shell', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Connect to RPC' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Disconnected').length).toBeGreaterThan(0)
  })
})
