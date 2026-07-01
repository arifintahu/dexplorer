import { Link, useParams } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
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

  const backLink = (
    <Link
      to="/accounts"
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: colors.text.secondary }}
    >
      <FiChevronLeft className="h-4 w-4" />
      Back to accounts
    </Link>
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-[18px]">
        {backLink}
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
    <div className="flex flex-col gap-[18px]">
      {backLink}
      <AccountHeader address={address} account={account} />
      <Balances balances={balances} stakedBalance={stakedBalance} />
      <TransactionList
        decodedTxs={decodedTxs}
        totalCount={transactions.length}
      />
    </div>
  )
}
