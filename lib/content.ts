import fs from 'node:fs'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import type { ReactElement } from 'react'
import { mdxComponents } from '@/components/mdx-components'
import { config } from './config'
import type { Service, ServiceArea } from './config-schema'

export const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface Frontmatter {
  /** Meta description override, 140 to 160 characters. */
  description?: string
  /** Manifest filename for this page's lead image (also used for og:image). */
  image?: string
}

export interface LoadedContent {
  content: ReactElement
  frontmatter: Frontmatter
}

export function contentExists(relPath: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, relPath))
}

export function readFrontmatter(relPath: string): Frontmatter {
  const file = path.join(CONTENT_DIR, relPath)
  if (!fs.existsSync(file)) return {}
  const raw = fs.readFileSync(file, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match?.[1]) return {}
  const fm: Frontmatter = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (!m) continue
    const key = m[1] as keyof Frontmatter
    const value = (m[2] ?? '').trim().replace(/^["']|["']$/g, '')
    if (key === 'description' || key === 'image') fm[key] = value
  }
  return fm
}

/**
 * Compile one MDX file from content/ with the fixed component library and the
 * config in scope, so prose can write {config.displayName} and <Phone /> but
 * never a bare fact.
 */
export async function loadContent(
  relPath: string,
  scope: { service?: Service; area?: ServiceArea } = {},
): Promise<LoadedContent> {
  const file = path.join(CONTENT_DIR, relPath)
  if (!fs.existsSync(file)) {
    throw new Error(`Missing content file: content/${relPath}. Every route in config needs a matching MDX file.`)
  }
  const source = fs.readFileSync(file, 'utf8')
  const { content, frontmatter } = await compileMDX<Frontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      scope: { config, ...scope },
      // next-mdx-remote 6 (CVE-2026-0969; Vercel blocks deploys on 5.x) turns
      // {expressions} OFF by default. Left off, the build still passes but every
      // {config.*} in content/ renders as an empty string ("based in , ."), with
      // no error anywhere. Content is authored in this repo, never user input, so
      // expressions stay on; blockDangerousJS keeps eval, Function, process, and
      // require blocked. verify.ts check 18 scans the rendered text for the blank
      // interpolations this would produce, so removing these lines fails the gate.
      blockJS: false,
      blockDangerousJS: true,
    },
  })
  return { content, frontmatter: frontmatter ?? {} }
}
