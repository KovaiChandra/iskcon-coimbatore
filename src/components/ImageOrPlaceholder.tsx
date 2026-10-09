import Image from 'next/image'
import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/format'
import { LotusMark } from './Icons'

type Props = {
  media: number | Media | null | undefined
  size?: 'thumb' | 'card' | 'hero'
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
}

/** Fills its (relative-positioned) parent. Shows a branded placeholder until staff upload a photo. */
export function ImageOrPlaceholder({ media, size = 'card', alt, className = '', sizes = '(min-width: 768px) 33vw, 100vw', priority }: Props) {
  const url = mediaUrl(media, size)
  if (!url) {
    return (
      <div className={`absolute inset-0 grid place-items-center bg-gradient-to-br from-purple-100 via-purple-50 to-saffron-100 ${className}`}>
        <LotusMark className="size-14 opacity-60" />
      </div>
    )
  }
  return (
    <Image
      src={url}
      alt={alt ?? (typeof media === 'object' && media ? media.alt : '')}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  )
}
