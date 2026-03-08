import { useParams } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { useAccountData } from '@/hooks/useAccountData'
import AccountHeader from '@/components/AccountDetail/AccountHeader'
import Balances from '@/components/AccountDetail/Balances'
import TransactionList from '@/components/AccountDetail/TransactionList'

export default function AccountDetail() {
  const { address } = useParams<{ address: string }>()
  const { colors } = useTheme()
  const {
    account,
    balances,
    stakedBalance,
    transactions,
    decodedTxs,
    loading,
  } = useAccountData(address)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Account
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: colors.primary }}
            ></div>
            <p style={{ color: colors.text.secondary }}>
              Loading account data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!address) return null

  return (
    <div className="space-y-6">
      <AccountHeader address={address} account={account} />
      <Balances balances={balances} stakedBalance={stakedBalance} />
      <TransactionList decodedTxs={decodedTxs} totalCount={transactions.length} />
    </div>
  )
}
