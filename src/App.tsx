import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { store, RootState } from '@/store'
import Layout from '@/components/Layout/Layout'
import Connect from '@/components/Connect'
import ErrorBoundary from '@/components/ErrorBoundary'
import { FiLoader } from 'react-icons/fi'

// Create a client
const queryClient = new QueryClient()

// Lazy load page components
const Home = lazy(() => import('@/pages/Home'))
const Blocks = lazy(() => import('@/pages/Blocks'))
const Validators = lazy(() => import('@/pages/Validators'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Proposals = lazy(() => import('@/pages/Proposals'))
const Accounts = lazy(() => import('@/pages/Accounts'))
const Parameters = lazy(() => import('@/pages/Parameters'))
const BlockDetail = lazy(() => import('@/pages/BlockDetail'))
const TransactionDetail = lazy(() => import('@/pages/TransactionDetail'))
const AccountDetail = lazy(() => import('@/pages/AccountDetail'))
const ProposalDetail = lazy(() => import('@/pages/ProposalDetail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
  </div>
)

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
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  )
}
