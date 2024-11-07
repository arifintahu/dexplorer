import bitcoin_logo from '../../public/assets/images/bitcoin_logo.svg'
import logo from '../../public/assets/images/logo.svg'
import pattern from '../../public/assets/images/pattern.png'

export type ImageType = 'logo' | 'pattern' | 'bitcoin_logo'

export type NextImage = {
  src: string
  height: number | string
  width: number | string
}

export const images: Record<ImageType, NextImage> = {
  logo,
  pattern,
  bitcoin_logo,
}
