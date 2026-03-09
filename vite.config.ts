import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react({
        babel: {
          plugins: ['react-dev-locator'],
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      'process.env.RPC_ADDRESS': JSON.stringify(env.RPC_ADDRESS),
      'process.env.CHAIN_NAME': JSON.stringify(env.CHAIN_NAME),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  }
})
