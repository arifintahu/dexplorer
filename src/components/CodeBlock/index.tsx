import { Box, useColorMode } from '@chakra-ui/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

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
      <SyntaxHighlighter language={language}>{codeString}</SyntaxHighlighter>
    </Box>
  )
}

export default CodeBlock
