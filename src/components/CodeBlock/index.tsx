// Updated to remove Chakra UI dependencies
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  atomOneLight,
  atomOneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useTheme } from '@/theme/ThemeProvider'

const CodeBlock = ({
  language,
  codeString,
}: {
  language: string
  codeString: string
}) => {
  const { colorScheme, colors } = useTheme()
  
  return (
    <div
      className="rounded p-4 border overflow-x-auto"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border.primary,
        boxShadow: colors.shadow.sm,
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={colorScheme === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{ background: 'none' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
