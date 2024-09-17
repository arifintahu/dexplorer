import { Box, useColorMode } from '@chakra-ui/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  materialDark,
  materialLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({
  language,
  codeString,
}: {
  language: string
  codeString: string
}) => {
  const { colorMode } = useColorMode()
  return (
    <Box overflow="hidden">
      <SyntaxHighlighter
        language={language}
        style={colorMode === 'dark' ? materialDark : materialLight}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlock
