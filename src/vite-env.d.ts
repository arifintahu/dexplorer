/// <reference types="vite/client" />

declare const process: {
  env: {
    RPC_ADDRESS?: string
    CHAIN_NAME?: string
    [key: string]: string | undefined
  }
}
