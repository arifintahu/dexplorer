import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { store, RootState } from '@/store'
import Layout from '@/components/Layout/Layout'
import Connect from '@/components/Connect'
import Home from '@/pages/Home'
import Blocks from '@/pages/Blocks'
import Validators from '@/pages/Validators'
import Transactions from '@/pages/Transactions'
import Proposals from '@/pages/Proposals'
import Accounts from '@/pages/Accounts'
import Parameters from '@/pages/Parameters'

// Placeholder component for detail pages
const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">Coming Soon...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const dispatch = useDispatch()
  const isConnected = useSelector(
    (state: RootState) => state.connect.connectState
  )

  // Check for existing connection on app start
  React.useEffect(() => {
    const savedRpcAddress = localStorage.getItem('rpc_address')
    if (savedRpcAddress) {
      // Auto-reconnect logic could be added here
      // For now, just set the RPC address but don't auto-connect
      // Users will need to manually connect
    }
  }, [dispatch])

  if (!isConnected) {
    return <Connect />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blocks" element={<Blocks />} />
        <Route
          path="/blocks/:height"
          element={<ComingSoon title="Block Details" />}
        />
        <Route path="/validators" element={<Validators />} />
        <Route
          path="/validators/:address"
          element={<ComingSoon title="Validator Details" />}
        />
        <Route path="/proposals" element={<Proposals />} />
        <Route
          path="/proposals/:id"
          element={<ComingSoon title="Proposal Details" />}
        />
        <Route path="/txs" element={<Transactions />} />
        <Route
          path="/txs/:hash"
          element={<ComingSoon title="Transaction Details" />}
        />
        <Route path="/accounts" element={<Accounts />} />
        <Route
          path="/accounts/:address"
          element={<ComingSoon title="Account Details" />}
        />
        <Route path="/parameters" element={<Parameters />} />
        <Route path="/connect" element={<Connect />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  )
}
