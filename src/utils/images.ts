import logo from '../../public/assets/images/logo.svg'

export type ImageType = 'logo'

export type NextImage = {
  src: string
  height: number | string
  width: number | string
}

export const images: Record<ImageType, NextImage> = {
  logo,
}
