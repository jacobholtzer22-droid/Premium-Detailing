import { config } from '@/lib/config'

/**
 * Trust line built only from facts that exist. Renders nothing at all when
 * every credential is null, so there is never an empty slot asking to be filled.
 */
export default function Credentials({ className = '' }: { className?: string }) {
  const items: string[] = []
  if (config.yearsInBusiness !== null) items.push(`${config.yearsInBusiness} years in business`)
  if (config.insured === true) items.push('Fully insured')
  if (config.licenseNumber) items.push(`License ${config.licenseNumber}`)
  if (items.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-primary-dark ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  )
}
