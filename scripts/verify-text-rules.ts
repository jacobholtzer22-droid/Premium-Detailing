/**
 * The rules behind verify check 18 (blank MDX interpolation), as a pure
 * function so they can be tested against strings without a build.
 *
 * Every rule is a structural signal that a word is missing from rendered
 * text: a value that rendered as "" leaves a double space, punctuation with
 * nothing in front of it, or a function word with nothing after it. None of
 * them know any site's copy.
 *
 * False positives are the enemy here more than misses: a blank almost always
 * trips two or three rules on the same page, so each rule can afford to be
 * conservative. Words that legitimately end a clause in English are kept out
 * of the "nothing after it" rules.
 */

/**
 * Words that never directly precede punctuation. "in,", "at,", "by.", "to.",
 * "for," and "with," all occur in real sentences ("fill in,", "stop by.",
 * "want to.") so they are not here.
 */
const NEVER_BEFORE_PUNCT = '(?:the|a|an|of|near|across|around|throughout|serving)'

/**
 * Words that never end a text. "for" is out ("what we're known for"), and
 * since TEMPLATE-HARDEN-02 so are "in" and "at": a client site had the
 * legitimate headings "What are you certified in" and "Which areas do you
 * install in". Those two words are handled by the narrower rule below.
 */
const NEVER_AT_END = '(?:by|from|of|with|near|around|across|the|a|an|and|or)'

/**
 * "in" and "at" DO end real headings, but only interrogative ones: a question
 * can strand its preposition ("Which areas do you install in"), a statement
 * cannot ("Lawn care in"). A trailing "in"/"at" is therefore flagged unless
 * the text is shaped like a question.
 *
 * "Shaped like a question" is grammatical, not just the first word. "What we
 * do in" opens with "What" but is a relative clause with a blank after it; a
 * real question puts an auxiliary verb before its subject: "What ARE you
 * certified in", "Which areas DO you install in", "Where SHOULD the lights go
 * at", "DO you work in". So: an auxiliary first, or a question word followed
 * by at most one non-pronoun word and then an auxiliary.
 *
 * Residual miss: a blank after "in" in a heading that is itself a question
 * ("Where do we work in {area}"). Residual false positive: a relative-clause
 * heading with no auxiliary ("Areas we work in"). Both are rare in trade copy,
 * and a blank almost always trips another rule on the same page.
 */
const STRANDABLE_AT_END = '(?:in|at)'
const WH = '(?:what|which|where|when|who|whom|whose|why|how)'
const AUX = '(?:do|does|did|can|could|should|would|will|is|are|was|were|have|has|may|might|am)'
const PRONOUN = '(?:i|we|you|they|he|she|it)'
const QUESTION_SHAPE = new RegExp(`^(?:${AUX}\\b|${WH}\\s+(?:(?!${PRONOUN}\\b)[\\w'-]+\\s+)?${AUX}\\b)`, 'i')

export interface TextRule {
  name: string
  /** Receives the raw text and its trimmed form; returns true when the rule fires. */
  test: (raw: string, trimmed: string) => boolean
}

export const TEXT_RULES: TextRule[] = [
  { name: 'double space inside text (empty value between two words)', test: (raw) => /\S {2,}\S/.test(raw) },
  { name: 'space before punctuation ("in , IL")', test: (raw) => /\S\s+[,.;:?!]/.test(raw) },
  {
    name: 'function word followed by punctuation ("the .")',
    test: (raw) => new RegExp(`\\b${NEVER_BEFORE_PUNCT}\\s*[,.;:]`, 'i').test(raw),
  },
  {
    name: 'text ends with a function word ("Serving homes across")',
    test: (_raw, trimmed) => new RegExp(`\\b${NEVER_AT_END}$`, 'i').test(trimmed),
  },
  {
    name: 'statement ends with "in" or "at" ("Lawn care in")',
    test: (_raw, trimmed) => new RegExp(`\\b${STRANDABLE_AT_END}$`, 'i').test(trimmed) && !QUESTION_SHAPE.test(trimmed),
  },
  { name: 'text starts with punctuation (", IL")', test: (_raw, trimmed) => /^[,.;:]/.test(trimmed) },
  { name: 'consecutive punctuation (", ,")', test: (raw) => /[,;:]\s*[,.;:]/.test(raw) },
]

/** Names of every rule the text trips. Empty means the text looks whole. */
export function blankInterpolationProblems(raw: string): string[] {
  const text = raw.replace(/\u00a0/g, ' ')
  const trimmed = text.trim()
  if (!trimmed) return []
  return TEXT_RULES.filter((r) => r.test(text, trimmed)).map((r) => r.name)
}
