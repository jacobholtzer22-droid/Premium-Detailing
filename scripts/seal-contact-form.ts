import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Re-baselines the ContactForm checksum. Run this ONLY in the template repo,
 * after a deliberate change to the platform contract, and commit the result
 * with the component change. Running it in a client repo to silence verify
 * check 4 defeats the purpose of the check.
 */
const FORM = path.join(process.cwd(), 'components/ContactForm.tsx')
const BASELINE = path.join(process.cwd(), 'scripts/contact-form.sha256')

const hash = createHash('sha256').update(fs.readFileSync(FORM)).digest('hex')
fs.writeFileSync(BASELINE, hash + '\n')
console.log(`components/ContactForm.tsx sealed: ${hash}`)
