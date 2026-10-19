import SectionVideo from './SectionVideo'

/**
 * The client's own footage, inline, in a phone-shaped frame.
 *
 * The clip is portrait (720x1280 as shot), so it does not belong behind the
 * hero. A phone frame is the honest way to show vertical footage on a wide
 * page: it reads as a phone video on purpose rather than as a letterboxed
 * mistake.
 *
 * All the playback behavior comes from SectionVideo: nothing preloads until
 * the frame is near the viewport, it plays only while on screen, it pauses on
 * the way out, and it never starts at all under prefers-reduced-motion or
 * data saver. In every one of those cases the poster is a real <img> that was
 * always rendered, so there is nothing to fall back to: the still is already
 * what you are looking at.
 */
export default function PhoneVideo({
  src,
  poster,
  alt,
  caption,
}: {
  src: string
  poster: string
  alt: string
  caption?: string
}) {
  return (
    <figure className="mt-10 flex flex-col items-center">
      <div className="relative aspect-[9/16] w-[250px] overflow-hidden rounded-[2rem] border-[6px] border-primary-dark bg-primary-dark shadow-site sm:w-[280px]">
        <SectionVideo desktop={src} mobile={src} poster={poster} alt={alt} />
      </div>
      {caption && <figcaption className="mt-4 text-center text-sm text-muted">{caption}</figcaption>}
    </figure>
  )
}
