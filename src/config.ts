// Configuration for the application
// Environment variables are injected by Vite at build time or runtime

const normalizeEnvValue = (value: string | undefined) => {
  if (!value) return ''

  const trimmedValue = value.trim()
  if (
    !trimmedValue ||
    trimmedValue === 'undefined' ||
    trimmedValue === 'null'
  ) {
    return ''
  }

  return trimmedValue
}

const rpcAddress = normalizeEnvValue(process.env.RPC_ADDRESS)
const chainName = normalizeEnvValue(process.env.CHAIN_NAME)

export const config = {
  // RPC address for bypass mode (optional)
  rpcAddress,

  // Chain name for bypass mode (optional)
  chainName,

  // Helper to check if bypass mode is active
  isBypassMode: Boolean(rpcAddress),
}
