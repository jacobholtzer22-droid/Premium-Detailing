/**
 * SEO length limits shared by lib/seo.ts (which documents them) and
 * scripts/verify.ts (which enforces them). Kept dependency-free so verify.ts
 * can import them without pulling lib/config.ts, which throws at load on a bad config.
 */
export const TITLE_MIN = 30
export const TITLE_MAX = 60
export const DESCRIPTION_MIN = 140
export const DESCRIPTION_MAX = 160
