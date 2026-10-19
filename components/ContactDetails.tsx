import { config, formatTime } from '@/lib/config'
import Phone from './Phone'

/** Phone always; email, address, and hours only when known. */
export default function ContactDetails() {
  return (
    <div className="rounded-site border border-line bg-surface p-6 text-sm">
      <h2 className="font-heading text-xl font-semibold text-primary-dark">Reach {config.displayName}</h2>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="font-semibold text-ink">Phone</dt>
          <dd>
            <Phone className="text-primary" />
          </dd>
        </div>
        {config.email && (
          <div>
            <dt className="font-semibold text-ink">Email</dt>
            <dd>
              <a href={`mailto:${config.email}`} className="text-primary underline-offset-2 hover:underline">
                {config.email}
              </a>
            </dd>
          </div>
        )}
        {config.address && (
          <div>
            <dt className="font-semibold text-ink">Address</dt>
            <dd>
              <address className="not-italic text-muted">
                {config.address.street}
                <br />
                {config.address.city}, {config.address.state} {config.address.zip}
              </address>
            </dd>
          </div>
        )}
        {(config.hoursDisplay || config.hours) && (
          <div>
            <dt className="font-semibold text-ink">Hours</dt>
            <dd>
              {/* hoursDisplay wins when set; config.hours still feeds schema. */}
              {config.hoursDisplay ? (
                <p className="text-muted">{config.hoursDisplay}</p>
              ) : (
                <ul className="text-muted">
                  {config.hours?.map((h) => (
                    <li key={h.day}>
                      {h.day}: {formatTime(h.open)} to {formatTime(h.close)}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
