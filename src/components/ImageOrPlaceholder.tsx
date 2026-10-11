import Image from 'next/image'
import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/format'
import { FestivalArt, type ArtTheme } from './art/FestivalArt'
import styles from './ImageOrPlaceholder.module.css'

type Props = {
  media: number | Media | null | undefined
  size?: 'thumb' | 'card' | 'hero'
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  art?: ArtTheme | null
}

/** Fills its (relative-positioned) parent. Shows an illustrated scene until staff upload a photo. */
export function ImageOrPlaceholder({ media, size = 'card', alt, className = '', sizes = '(min-width: 768px) 33vw, 100vw', priority, art }: Props) {
  const url = mediaUrl(media, size)
  if (!url) {
    return (
      <FestivalArt compact theme={art ?? 'lotus'} className={`${styles.art} ${className}`} />
    )
  }
  return (
    <Image
      src={url}
      alt={alt ?? (typeof media === 'object' && media ? media.alt : '')}
      fill
      sizes={sizes}
      priority={priority}
      className={`${styles.image} ${className}`}
    />
  )
}
