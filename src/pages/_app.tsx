import '@/styles/globals.css'

import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

import Layout from '@/components/Layout'
import { wrapper } from '@/store'
import theme from '@/theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}

export default wrapper.withRedux(App)
