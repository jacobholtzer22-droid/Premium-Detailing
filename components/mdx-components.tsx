import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'
import Credentials from './Credentials'
import Gallery from './Gallery'
import Img from './Img'
import Phone from './Phone'
import ServiceGrid from './ServiceGrid'
import AreaList from './AreaList'
import BeforeAfter from './BeforeAfter'
import CoverageList from './CoverageList'
import PhoneVideo from './PhoneVideo'
import Testimonials from './Testimonials'

/**
 * Everything a content file may use. Facts arrive through these components or
 * through {config.*} interpolation; nothing else is available to MDX.
 */

function H1(): never {
  throw new Error(
    'Content files must not contain an H1 ("# ..."). The page template renders the H1 from config. Start the file at "## ".',
  )
}

function Anchor({ href = '', children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const internal = href.startsWith('/')
  if (internal) {
    return (
      <Link href={href} className="font-medium text-primary underline-offset-2 hover:underline" {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} rel="noopener" target={href.startsWith('http') ? '_blank' : undefined} className="font-medium text-primary underline-offset-2 hover:underline" {...rest}>
      {children}
    </a>
  )
}

export const mdxComponents: MDXComponents = {
  h1: H1,
  h2: (props) => <h2 className="mt-12 font-heading text-2xl font-bold text-primary-dark md:text-3xl" {...props} />,
  h3: (props) => <h3 className="mt-8 font-heading text-xl font-semibold text-primary-dark" {...props} />,
  p: (props) => <p className="mt-4 text-base leading-relaxed text-ink" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-ink" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-ink" {...props} />,
  li: (props) => <li {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  blockquote: (props) => <blockquote className="mt-6 border-l-4 border-blue-text pl-4 italic text-muted" {...props} />,
  hr: () => <hr className="my-10 border-line" />,
  a: Anchor,
  Phone,
  Img,
  Gallery,
  ServiceGrid,
  AreaList,
  Credentials,
  BeforeAfter,
  CoverageList,
  PhoneVideo,
  Testimonials,
}
