import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  atomOneLight,
  atomOneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/hljs'

const CodeBlock = ({
  language,
  codeString,
}: {
  language: string
  codeString: string
}) => {
  const { colorMode } = useColorMode()
  const bgColor = useColorModeValue('light-container', 'dark-container')
  return (
    <Box
      as="pre"
      bg={bgColor}
      borderRadius={4}
      p={4}
      border={'1px'}
      borderColor={useColorModeValue('gray.300', 'gray.700')}
      overflowX="auto"
    >
      <SyntaxHighlighter
        language={language}
        style={colorMode === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{ background: 'none' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlock
