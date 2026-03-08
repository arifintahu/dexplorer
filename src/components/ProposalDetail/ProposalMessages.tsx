import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { decodeMsg } from '@/encoding'
import { safeStringify } from '@/utils/helper'

interface ProposalMessagesProps {
  proposal: Proposal
}

export default function ProposalMessages({ proposal }: ProposalMessagesProps) {
  const { colors } = useTheme()

  if (!proposal.messages || proposal.messages.length === 0) return null

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Messages ({proposal.messages.length})
      </h3>
      <div className="space-y-4">
        {proposal.messages.map((message, index) => {
          const decodedMsg = decodeMsg(message.typeUrl, message.value)
          
          return (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: colors.primary + '20',
                    color: colors.primary,
                  }}
                >
                  {message.typeUrl}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: decodedMsg.data ? colors.status.success + '20' : colors.status.warning + '20',
                    color: decodedMsg.data ? colors.status.success : colors.status.warning,
                  }}
                >
                  {decodedMsg.data ? 'Decoded' : 'Raw'}
                </span>
              </div>
              
              {decodedMsg.data ? (
                <div className="space-y-2">
                  {Object.entries(decodedMsg.data).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.text.tertiary }}
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div
                        className="text-sm font-mono p-2 rounded border"
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border.secondary,
                          color: colors.text.primary
                        }}
                      >
                        {typeof value === 'object' && value !== null
                          ? safeStringify(value, 2)
                          : String(value)
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <pre
                  className="text-sm overflow-x-auto"
                  style={{ color: colors.text.secondary }}
                >
                  {JSON.stringify(message.value, null, 2)}
                </pre>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
