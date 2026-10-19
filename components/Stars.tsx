/**
 * Five filled stars, as a decoration.
 *
 * Always aria-hidden: every place this is used prints the rating in words
 * beside it, so a screen reader would otherwise read the figure twice. The
 * fill is theme.palette.star, an amber that belongs to no platform, because
 * borrowing Google's exact star color next to the word "Google" edges into
 * passing the section off as Google's own.
 */
export default function Stars({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <span aria-hidden="true" role="presentation" className={`inline-flex flex-shrink-0 items-center gap-0.5 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--c-star)">
          <path d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.62l-5.88 3.09 1.12-6.55L2.48 9.52l6.58-.96z" />
        </svg>
      ))}
    </span>
  )
}
