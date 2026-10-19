/**
 * The vehicle silhouettes with no lettering, for the places that want the
 * brand present but not announced: the Book page eyebrow and the contact
 * card heading.
 *
 * Rendered as a CSS background on an aria-hidden span, not an <img>, because
 * it is pure decoration sitting next to the business name in text. An <img>
 * here would either need a description that duplicates the adjacent words or
 * an empty alt, and verify check 11 rightly insists that every <img> on the
 * page is described. Decoration belongs in CSS; content belongs in <img>.
 */
export default function BrandMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={`inline-block flex-shrink-0 bg-contain bg-center bg-no-repeat ${className}`}
      style={{ width: size, height: size, backgroundImage: "url('/brand/logo-mark.png')" }}
    />
  )
}
