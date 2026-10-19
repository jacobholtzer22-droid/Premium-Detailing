'use client'

import { useMemo, useState } from 'react'
import { config } from '@/lib/config'
import { getImage } from '@/lib/images'

/**
 * config.images.gallery on a full-dark section: the homepage's guaranteed
 * change of visual treatment. Nothing renders when the list is empty.
 *
 * The photos are phone photos in mixed orientation, so every tile is a 4:5
 * portrait cell and the landscape ones span two columns at `lg` instead of
 * being letterboxed into a portrait box. `grid-auto-flow: dense` backfills the
 * gaps that leaves.
 *
 * Orientation is NOT authored in config. It is read from the manifest's real
 * pixel dimensions, so it cannot drift from the file on disk.
 */
const ALL = 'All'

export default function Gallery({ heading = 'Recent Work' }: { heading?: string }) {
  const items = useMemo(
    () =>
      config.images.gallery.map((g) => {
        const img = getImage(g.name)
        return { ...g, img, landscape: img.width > img.height }
      }),
    [],
  )

  const tags = useMemo(() => {
    const seen: string[] = []
    for (const i of items) if (!seen.includes(i.tag)) seen.push(i.tag)
    return [ALL, ...seen]
  }, [items])

  const [active, setActive] = useState(ALL)

  if (items.length === 0) return null

  const label = (t: string) => (t === ALL ? ALL : t.charAt(0).toUpperCase() + t.slice(1))

  return (
    <section className="bg-primary-dark text-on-primary">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">{heading}</h2>

        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              aria-pressed={active === t}
              className={`btn rounded-full px-4 py-2 text-sm font-semibold ${
                active === t ? 'bg-accent text-on-accent' : 'border border-on-primary/25 text-on-primary hover:border-accent'
              }`}
            >
              {label(t)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 [grid-auto-flow:dense] lg:grid-cols-4">
          {items.map((it) => {
            const hidden = active !== ALL && it.tag !== active
            return (
              <figure
                key={it.name}
                aria-hidden={hidden || undefined}
                className={`tile relative overflow-hidden rounded-site ba-fade ${hidden ? 'hidden' : ''} ${
                  it.landscape ? 'aspect-[4/5] lg:col-span-2 lg:aspect-[8/5]' : 'aspect-[4/5]'
                }`}
              >
                <img
                  src={it.img.src}
                  srcSet={it.img.srcSet}
                  sizes={it.landscape ? '(min-width:1024px) 50vw, 50vw' : '(min-width:1024px) 25vw, 50vw'}
                  width={it.img.width}
                  height={it.img.height}
                  alt={it.img.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
