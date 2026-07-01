import React from 'react'
import { useSelector } from 'react-redux'
import { FiActivity, FiArrowRight } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { RootState } from '@/store'
import { useIBCTransfers } from '@/hooks/useIBCTransfers'
import { formatAmount, formatDenom, getConvertedAmount } from '@/utils/cosmos'
import { getResultPillStyle } from '@/utils/pillStyle'

const MAX_DENOM_LENGTH = 16

// formatDenom already truncates ibc/ hashes; apply the same treatment to any
// other overly-long denom (e.g. factory/<addr>/<subdenom>) without touching
// formatDenom itself, since other pages depend on its exact ibc/ behavior.
const displayDenom = (denom: string): string => {
  const formatted = formatDenom(denom)
  if (formatted.length > MAX_DENOM_LENGTH) {
    return formatted.slice(0, MAX_DENOM_LENGTH) + '...'
  }
  return formatted
}

const CHAIN_NAMES: Record<string, string> = {
  cosmos: 'Cosmos Hub',
  osmo: 'Osmosis',
  stride: 'Stride',
  neutron: 'Neutron',
  noble: 'Noble',
  axelar: 'Axelar',
  inj: 'Injective',
  juno: 'Juno',
}

const IBCTransfers: React.FC = () => {
  const { colors } = useTheme()
  const { ibcTransfers, isLoading, hasTransfers } = useIBCTransfers()
  const { connectState } = useSelector((state: RootState) => state.connect)

  const getChainEndpoint = (address: string, fallbackPort: string) => {
    const prefix = address.includes('1') ? address.split('1')[0] : fallbackPort
    const normalizedPrefix = prefix.toLowerCase()
    const label =
      CHAIN_NAMES[normalizedPrefix] ||
      (normalizedPrefix
        ? normalizedPrefix.charAt(0).toUpperCase() + normalizedPrefix.slice(1)
        : 'Unknown')

    return {
      badge: label
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      label,
    }
  }

  return (
    <div className="space-y-5">
      <div className="reference-table-shell">
        {!connectState ? (
          <div className="py-12 text-center">
            <FiActivity
              className="mx-auto mb-4 h-12 w-12 opacity-50"
              style={{ color: colors.text.tertiary }}
            />
            <p style={{ color: colors.text.secondary }}>
              Not connected to blockchain
            </p>
            <p className="mt-1 text-sm" style={{ color: colors.text.tertiary }}>
              Please connect to an RPC endpoint to view IBC transfers
            </p>
          </div>
        ) : !hasTransfers && !isLoading ? (
          <div className="py-12 text-center">
            <FiActivity
              className="mx-auto mb-4 h-12 w-12 opacity-50"
              style={{ color: colors.text.tertiary }}
            />
            <p style={{ color: colors.text.secondary }}>No IBC transfers yet</p>
            <p className="mt-1 text-sm" style={{ color: colors.text.tertiary }}>
              IBC transfers will appear here when they occur on the network
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: colors.border.primary }}
                >
                  <th className="reference-table-header px-5 py-4 text-left">
                    Source
                  </th>
                  <th className="reference-table-header px-5 py-4 text-left">
                    Destination
                  </th>
                  <th className="reference-table-header px-5 py-4 text-left">
                    Channel
                  </th>
                  <th className="reference-table-header px-5 py-4 text-left">
                    Amount
                  </th>
                  <th className="reference-table-header px-5 py-4 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ibcTransfers.map((transfer, index) => {
                  const source = getChainEndpoint(
                    transfer.sender,
                    transfer.sourcePort
                  )
                  const destination = getChainEndpoint(
                    transfer.receiver,
                    transfer.destinationPort
                  )
                  const channel =
                    transfer.sourceChannel || transfer.destinationChannel || ''
                  const { converted, base } = getConvertedAmount(
                    transfer.amount,
                    transfer.denom
                  )

                  return (
                    <tr
                      key={`${transfer.hash}-${index}`}
                      className="reference-table-row border-b"
                      style={{ borderColor: colors.border.primary }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-semibold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                            }}
                          >
                            {source.badge}
                          </div>
                          <span style={{ color: colors.text.primary }}>
                            {source.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FiArrowRight
                            className="h-4 w-4"
                            style={{ color: colors.text.tertiary }}
                          />
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-semibold text-white"
                              style={{
                                background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
                              }}
                            >
                              {destination.badge}
                            </div>
                            <span style={{ color: colors.text.primary }}>
                              {destination.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {channel || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-sm"
                          style={{ color: colors.text.primary }}
                          title={transfer.denom}
                        >
                          {formatAmount(converted)}{' '}
                          {displayDenom(base).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className="reference-pill"
                          style={getResultPillStyle(
                            transfer.status === 'success',
                            colors
                          )}
                        >
                          {transfer.status === 'success'
                            ? 'Completed'
                            : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default IBCTransfers
