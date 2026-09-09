import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

/** Renders Velite's compiled MDX (a function body string). Runs at build time only. */
export function MDXContent({ code }: { code: string }) {
  const Component = new Function(code)({ ...runtime }).default
  return <Component components={mdxComponents} />
}
