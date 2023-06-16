import { Theme, extendTheme } from '@chakra-ui/react'
import { colors } from './colors'
import { components } from './components'

const theme: Theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  } as Theme['config'],
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    mono: 'IBM Plex Mono, monospace',
  },
  styles: {},
  colors,
  components,
}) as Theme

export default theme
