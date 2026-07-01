import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { decodeMsg } from '@/encoding'
import { getTypeMsg, isBech32Address, safeStringify } from '@/utils/helper'

interface ProposalMessagesProps {
  proposal: Proposal
}

const stringifyField = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (typeof value === 'object') return safeStringify(value, 2)
  return String(value)
}

export default function ProposalMessages({ proposal }: ProposalMessagesProps) {
  const { colors } = useTheme()

  if (!proposal.messages || proposal.messages.length === 0) return null

  const messageRows = proposal.messages.map((message) => {
    const decoded = decodeMsg(message.typeUrl, message.value)
    const fields = Object.entries(decoded.data || {}).map(([key, value]) => ({
      key,
      value,
    }))

    return {
      fields,
      type: getTypeMsg(decoded.typeUrl),
      typeUrl: decoded.typeUrl,
      raw: message.value,
    }
  })

  return (
    <div className="reference-table-shell rounded-[14px]">
      <div
        className="border-b px-5 py-[15px] text-[14px] font-semibold"
        style={{
          borderColor: colors.border.primary,
          color: colors.text.primary,
        }}
      >
        Messages ({proposal.messages.length})
      </div>

      <div className="px-5 py-[18px]">
        <div
          className="rounded-[11px] border px-[18px] py-4"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border.primary,
          }}
        >
          {messageRows.map((message, messageIndex) => (
            <div key={`${message.typeUrl}-${messageIndex}`}>
              <div className="mb-2 flex flex-wrap items-center gap-[10px]">
                <span
                  className="reference-pill"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                  }}
                >
                  {message.type}
                </span>
                <span
                  className="font-mono text-[11.5px]"
                  style={{ color: colors.text.tertiary }}
                >
                  {message.typeUrl}
                </span>
              </div>

              {message.fields.length > 0 ? (
                message.fields.map((field, fieldIndex) => (
                  <div
                    key={`${field.key}-${fieldIndex}`}
                    className="flex flex-col justify-between gap-2 border-t py-[9px] md:flex-row md:items-start md:gap-[18px]"
                    style={{ borderColor: colors.border.primary }}
                  >
                    <span
                      className="text-[12.5px]"
                      style={{ color: colors.text.secondary }}
                    >
                      {field.key}
                    </span>
                    <div
                      className="font-mono text-[12.5px] break-all md:max-w-[70%] md:text-right"
                      style={{ color: colors.text.primary }}
                    >
                      {typeof field.value === 'string' &&
                      isBech32Address(field.value) ? (
                        <Link
                          to={`/accounts/${field.value}`}
                          style={{ color: colors.primary }}
                        >
                          {field.value}
                        </Link>
                      ) : (
                        stringifyField(field.value)
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <pre
                  className="border-t py-[9px] text-[12.5px] overflow-x-auto whitespace-pre-wrap break-words"
                  style={{
                    borderColor: colors.border.primary,
                    color: colors.text.secondary,
                  }}
                >
                  {JSON.stringify(message.raw, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
