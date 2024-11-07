import bitcoin_logo from '../../public/assets/images/bitcoin_logo.svg'
import logo from '../../public/assets/images/logo.svg'
import pattern from '../../public/assets/images/pattern.png'
import blockLogo from '../../public/assets/images/bx-cube.svg'
import rightArrow from '../../public/assets/images/right-arrow.svg'

export type ImageType =
  | 'logo'
  | 'pattern'
  | 'bitcoin_logo'
  | 'blockLogo'
  | 'rightArrow'

export type NextImage = {
  src: string
  height: number | string
  width: number | string
}

export const images: Record<ImageType, NextImage> = {
  logo,
  pattern,
  bitcoin_logo,
  blockLogo,
  rightArrow,
}
