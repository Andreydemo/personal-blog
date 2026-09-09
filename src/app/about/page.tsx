import Image from 'next/image'
import { JsonLd } from '@/components/json-ld'
import { person, profilePage } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/metadata'
import { site } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'About',
  description: `${site.author.name}: ${site.author.bio}`,
  path: '/about',
})

export default function AboutPage() {
  const links = [
    { label: 'GitHub', href: site.social.github },
    { label: 'LinkedIn', href: site.social.linkedin },
    { label: 'X', href: site.social.x },
  ].filter((link) => link.href.length > 0)
  const role = [site.author.jobTitle, site.author.employer].filter(Boolean).join(' at ')

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <JsonLd data={person(site)} />
      <JsonLd data={profilePage(site)} />
      <h1>{site.author.name}</h1>
      {site.author.image && (
        <Image src={site.author.image} alt={site.author.name} width={160} height={160} className="rounded-full" />
      )}
      {role && <p className="lead">{role}</p>}
      <p>{site.author.bio}</p>
      <h2>Elsewhere</h2>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} rel="me">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <h2>This site</h2>
      <p>
        Every post is also available as markdown (append <code>.md</code> to a post URL), through{' '}
        <a href="/feed.xml">RSS</a>, and in <a href="/llms.txt">llms.txt</a>.
      </p>
    </article>
  )
}
