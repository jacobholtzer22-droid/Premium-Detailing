import { getImage } from '@/lib/images'

interface ImgProps {
  /** Original filename, the key in public/images/manifest.json. */
  name: string
  className?: string
  /** CSS sizes hint for the browser. */
  sizes?: string
  priority?: boolean
}

/**
 * Renders a processed image with its srcset and the alt text from the manifest.
 * getImage throws at build for an unknown file or a missing alt.
 */
export default function Img({ name, className = '', sizes = '(min-width: 1024px) 50vw, 100vw', priority = false }: ImgProps) {
  const img = getImage(name)
  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={img.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}
