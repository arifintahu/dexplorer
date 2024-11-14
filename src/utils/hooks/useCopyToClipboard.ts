import { useToast } from '@chakra-ui/react'
import { useState } from 'react'

type TCopiedValue = string | null
type TCopyFn = (text: string) => Promise<boolean>

const useCopyToClipboard = (): [TCopiedValue, TCopyFn] => {
  const [copiedText, setCopiedText] = useState<TCopiedValue>(null)
  const toast = useToast()

  const copy: TCopyFn = async (text) => {
    if (!navigator?.clipboard) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.prepend(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (error) {
        console.error(error)
      } finally {
        textArea.remove()
      }
      toast({
        title: 'Copied to clipboard',
        description: '',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      return false
    }

    try {
      await navigator?.clipboard?.writeText(text)
      toast({
        title: 'Copied to clipboard',
        description: '',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      setCopiedText?.(text)
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}

export { useCopyToClipboard }
