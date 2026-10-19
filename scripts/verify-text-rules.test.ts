import assert from 'node:assert/strict'
import { test } from 'node:test'
import { blankInterpolationProblems } from './verify-text-rules'

/**
 * Run with `npm test`. Legitimate copy must trip nothing; each blank must trip
 * at least one rule. The legitimate cases matter more: a false positive fails a
 * client build on good copy.
 */

const LEGITIMATE = [
  // Headings from a live client site that TEMPLATE-HARDEN-01's rule d failed.
  'What are you certified in',
  'Which areas do you install in',
  'Where should the lights go at',
  'Do you work in',
  'How long does a cleanup take in',
  // Clause-ending particles.
  'Newer beds need mulch topped up more often while plantings fill in, and the bigger lawns benefit.',
  'Stop by.',
  'We know what we are known for',
  // Ordinary rendered text from the template.
  'Lawn Mowing in Springfield, IL',
  'Sample Lawn Care handles mowing, mulch, and seasonal cleanups for homeowners in Springfield and the surrounding towns.',
  'Monday: 8:00 AM to 5:00 PM',
  'or call (555) 555-0123',
  '© 2026 Sample Lawn Care LLC. All rights reserved.',
  'Which areas do you serve?+',
]

const BLANKS: Record<string, string> = {
  'Lawn care in': 'heading with a blank {area.name}',
  'What we do in': 'relative-clause heading with a blank {area.name}',
  'How we work in': 'relative-clause heading with a blank {area.name}',
  'Why neighbors call us in': 'statement heading with a blank {area.name}',
  'Serving homes across': 'text ending in a never-at-end word',
  'is a small, local crew based in . We keep the client list short': 'blank before a period',
  'We serve  and the nearby communities': 'double space',
  ' is where  is based, so most of our routes': 'double space',
  'offers mowing in , IL': 'blank before a comma',
  ', IL': 'leading punctuation',
  'Springfield, , 62701': 'consecutive punctuation',
  'the .': 'function word before punctuation',
}

test('legitimate copy trips no rule', () => {
  for (const text of LEGITIMATE) {
    assert.deepEqual(blankInterpolationProblems(text), [], `false positive on "${text}"`)
  }
})

test('every blank trips at least one rule', () => {
  for (const [text, why] of Object.entries(BLANKS)) {
    const hits = blankInterpolationProblems(text)
    assert.ok(hits.length > 0, `missed ${why}: "${text}"`)
  }
})

test('a trailing "in" is caught on a statement and allowed on a question', () => {
  assert.ok(blankInterpolationProblems('Lawn care in').length > 0)
  assert.deepEqual(blankInterpolationProblems('Which areas do you install in'), [])
})
