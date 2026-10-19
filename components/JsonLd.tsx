/**
 * The only way JSON-LD reaches a page. Serializes with `<` escaped so a value
 * containing "</script>" cannot break out of the tag. Pass objects built by
 * lib/schema.ts; never hand-write a block. `null` renders nothing, which is how
 * faqPage([]) stays off the page.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
