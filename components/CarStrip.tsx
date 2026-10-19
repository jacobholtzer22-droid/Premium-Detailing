import Link from 'next/link'
import { config } from '@/lib/config'
import { getImage } from '@/lib/images'

/**
 * A full-bleed moving row of the client's own cars, directly under the rating
 * bar.
 *
 * The track is config.carStrip rendered twice and translated by exactly half
 * its width, which is what makes the loop seamless: at -50% the second copy
 * sits precisely where the first started. The duplicate half is aria-hidden
 * and not focusable, so a screen reader and a keyboard both see the strip
 * once; its images keep their real alt text rather than an empty one, because
 * a decorative duplicate of a described image is still that image.
 *
 * Under prefers-reduced-motion the animation is off, the duplicate half is
 * removed entirely, and the row becomes a plain horizontally scrollable strip
 * with scroll snapping. Both branches live in app/globals.css.
 */
export default function CarStrip() {
  const items = config.carStrip.map((name) => ({ name, img: getImage(name) }))
  if (items.length === 0) return null

  const tile = (name: string, img: ReturnType<typeof getImage>, dupe: boolean) => (
    <li
      key={`${dupe ? 'b' : 'a'}-${name}`}
      className={`carstrip-tile flex-shrink-0 ${dupe ? 'carstrip-dupe' : ''}`}
      {...(dupe ? { 'aria-hidden': true } : {})}
    >
      <Link
        href="/gallery"
        tabIndex={dupe ? -1 : undefined}
        className="tile relative block h-[150px] w-[220px] overflow-hidden rounded-site lg:h-[200px] lg:w-[300px]"
      >
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="300px"
          width={img.width}
          height={img.height}
          alt={img.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Link>
    </li>
  )

  return (
    <section aria-label="Recent vehicles" className="carstrip border-b border-line bg-primary-dark py-4">
      <ul className="carstrip-track flex w-max list-none gap-3 px-3">
        {items.map((it) => tile(it.name, it.img, false))}
        {items.map((it) => tile(it.name, it.img, true))}
      </ul>
    </section>
  )
}
