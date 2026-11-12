import { config } from '@/lib/config'
import Img from './Img'

/**
 * The founder section on the About page.
 *
 * RENDERS NOTHING when config.founder is null, which is where it stands today.
 * The owner was asked for a founder story, a photo and the link to his WPTV
 * appearance and has not sent them, so this is scaffolding: the moment the
 * block is filled in config, the section appears and the page stops being a
 * paraphrase of the homepage.
 *
 * It is wired this way rather than written speculatively because an About page
 * is the one page where a customer can tell the difference between the owner's
 * voice and somebody writing in it. An invented origin story reads as exactly
 * what it is.
 *
 * Paragraphs come from blank-line breaks in `story`, so the owner can send
 * three paragraphs of plain text and they render as three paragraphs.
 */
export default function FounderNote() {
  const founder = config.founder
  if (!founder) return null

  const paragraphs = founder.story
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="grid gap-8 md:grid-cols-5">
        {founder.image && (
          <div className="md:col-span-2">
            <div className="overflow-hidden rounded-site">
              <Img name={founder.image} sizes="(min-width: 768px) 38vw, 100vw" className="h-auto w-full" />
            </div>
          </div>
        )}
        <div className={founder.image ? 'md:col-span-3' : 'md:col-span-5'}>
          <h2 className="font-heading text-2xl font-bold text-primary-dark md:text-3xl">{founder.name}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-blue-text">{founder.role}</p>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed text-ink">
              {p}
            </p>
          ))}
          {founder.press && (
            <p className="mt-6">
              <a
                href={founder.press.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                {founder.press.label}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
