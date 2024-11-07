import bitcoinLogo from '../../public/assets/images/bitcoin_logo.svg'
import blockLogo from '../../public/assets/images/bx-cube.svg'
import chainLink from '../../public/assets/images/chain_link.svg'
import logo from '../../public/assets/images/logo.svg'
import logoShort from '../../public/assets/images/logo_short.svg'
import pattern from '../../public/assets/images/pattern.png'
import rightArrow from '../../public/assets/images/right-arrow.svg'
import stars from '../../public/assets/images/stars.svg'

export type ImageType =
  | 'logo'
  | 'pattern'
  | 'blockLogo'
  | 'rightArrow'
  | 'bitcoinLogo'
  | 'chainLink'
  | 'stars'
  | 'logoShort'

export type NextImage = {
  src: string
  height: number | string
  width: number | string
}

export const images: Record<ImageType, NextImage> = {
  logo,
  pattern,
  blockLogo,
  rightArrow,
  bitcoinLogo,
  chainLink,
  stars,
  logoShort,
}
