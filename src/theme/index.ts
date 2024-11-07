import '@fontsource-variable/inter'

import { extendTheme, Theme } from '@chakra-ui/react'

import { colors } from './colors'
import { components } from './components'

const theme: Theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  } as Theme['config'],
  fonts: {
    heading: 'Inter Variable, sans-serif',
    body: 'Inter Variable, sans-serif',
    mono: 'IBM Plex Mono, monospace',
  },
  styles: {},
  colors,
  components,
}) as Theme

export default theme
