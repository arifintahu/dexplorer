import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
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
// Import detail page components
import BlockDetail from '@/pages/BlockDetail'
import TransactionDetail from '@/pages/TransactionDetail'
import AccountDetail from '@/pages/AccountDetail'
import ProposalDetail from '@/pages/ProposalDetail'

function AppContent() {
  const isConnected = useSelector(
    (state: RootState) => state.connect.connectState
  )

  // Auto-reconnection is handled in the Connect component

  if (!isConnected) {
    return <Connect />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blocks" element={<Blocks />} />
        <Route path="/blocks/:height" element={<BlockDetail />} />
        <Route path="/validators" element={<Validators />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />
        <Route path="/txs" element={<Transactions />} />
        <Route path="/txs/:hash" element={<TransactionDetail />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:address" element={<AccountDetail />} />
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
