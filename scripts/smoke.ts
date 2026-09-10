import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { site } from '../src/lib/site'

const PORT = 3999
const BASE = `http://localhost:${PORT}`
const SITEMAP_URL = `${site.url}/sitemap.xml`

type Post = { slug: string; draft: boolean; raw: string; toc: { title: string; url: string }[] }
type JsonLd = { '@type'?: string; '@id'?: string; author?: { '@id'?: string } }

const posts: Post[] = JSON.parse(readFileSync('.velite/posts.json', 'utf8'))
const published = posts.find((post) => !post.draft)
if (!published) {
  console.error('smoke: need at least one published post')
  process.exit(1)
}
const seed = published.slug
const failures: string[] = []

function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` (${detail})`}`)
  if (!ok) failures.push(name)
}

const contentType = (res: Response) => res.headers.get('content-type') ?? ''

function jsonLdBlocks(html: string): JsonLd[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error('smoke: server did not start within 60s')
}

async function run() {
  const robots = await (await fetch(`${BASE}/robots.txt`)).text()
  check('robots.txt allows GPTBot', /user-agent: GPTBot/i.test(robots))
  check('robots.txt names the sitemap', robots.includes(`Sitemap: ${SITEMAP_URL}`))

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
  check('sitemap lists the published post', sitemap.includes(`/posts/${seed}</loc>`))
  for (const draft of posts.filter((post) => post.draft)) {
    check(`sitemap hides draft ${draft.slug}`, !sitemap.includes(`/posts/${draft.slug}</loc>`))
  }
  check('sitemap has no markdown twins', !sitemap.includes('.md</loc>'))

  for (const path of ['/llms.txt', '/llms-full.txt']) {
    const res = await fetch(`${BASE}${path}`)
    check(`${path} is 200 text/plain`, res.ok && contentType(res).startsWith('text/plain'), contentType(res))
  }

  const twin = await fetch(`${BASE}/posts/${seed}.md`)
  const twinText = await twin.text()
  check('.md twin is text/markdown', twin.ok && contentType(twin).startsWith('text/markdown'), contentType(twin))
  check('.md twin starts with the front block', twinText.startsWith('---\ntitle: '))

  const negotiated = await fetch(`${BASE}/posts/${seed}`, { headers: { accept: 'text/markdown' } })
  check('Accept: text/markdown returns markdown', contentType(negotiated).startsWith('text/markdown'), contentType(negotiated))
  const twinIgnoringAccept = await fetch(`${BASE}/posts/${seed}.md`, { headers: { accept: 'text/html' } })
  check('.md twin ignores Accept', contentType(twinIgnoringAccept).startsWith('text/markdown'))
  const twinWithMarkdownAccept = await fetch(`${BASE}/posts/${seed}.md`, { headers: { accept: 'text/markdown' } })
  check('.md twin with Accept: text/markdown returns markdown', contentType(twinWithMarkdownAccept).startsWith('text/markdown'))

  const page = await fetch(`${BASE}/posts/${seed}`, { headers: { accept: 'text/html' } })
  const html = await page.text()
  check('Accept: text/html returns html', contentType(page).startsWith('text/html'), contentType(page))
  check(
    'post links its markdown alternate',
    html.includes('type="text/markdown"') && html.includes(`href="${site.url}/posts/${seed}.md"`),
  )

  const article = jsonLdBlocks(html).find((block) => block['@type'] === 'BlogPosting')
  check('post carries BlogPosting JSON-LD', article !== undefined)
  const aboutHtml = await (await fetch(`${BASE}/about`)).text()
  const person = jsonLdBlocks(aboutHtml).find((block) => block['@type'] === 'Person')
  check('About carries Person JSON-LD', person !== undefined)
  check(
    'BlogPosting author @id matches the Person @id',
    article?.author?.['@id'] !== undefined && article.author['@id'] === person?.['@id'],
    `${article?.author?.['@id']} vs ${person?.['@id']}`,
  )

  const rss = await (await fetch(`${BASE}/feed.xml`)).text()
  check('feed.xml has the seed post', rss.includes('<item>') && rss.includes(`/posts/${seed}`))
  const atom = await (await fetch(`${BASE}/atom.xml`)).text()
  check('atom.xml has the seed post', atom.includes('<entry>') && atom.includes(`/posts/${seed}`))
  const json = JSON.parse(await (await fetch(`${BASE}/feed.json`)).text()) as { items: { url: string }[] }
  check('feed.json has the seed post', json.items.some((item) => item.url.endsWith(`/posts/${seed}`)))

  for (const tag of site.featuredTags) {
    check(`featured tag /tags/${tag} is 200`, (await fetch(`${BASE}/tags/${tag}`)).status === 200)
  }

  const longPost = posts.find((post) => post.toc.length >= 5)
  if (longPost) {
    const longHtml = await (await fetch(`${BASE}/posts/${longPost.slug}`)).text()
    const firstId = longPost.toc[0].url.replace(/^#/, '')
    check(`contents nav is rendered on /posts/${longPost.slug}`, longHtml.includes('aria-label="Contents"'))
    check(`headings carry ids on /posts/${longPost.slug}`, longHtml.includes(`id="${firstId}"`), firstId)
  }
  const diagramPost = posts.find((post) => post.raw.includes('```mermaid'))
  if (diagramPost) {
    const diagramHtml = await (await fetch(`${BASE}/posts/${diagramPost.slug}`)).text()
    check(`mermaid source is server-rendered on /posts/${diagramPost.slug}`, diagramHtml.includes('language-mermaid'))
  }

  check('unknown post is 404', (await fetch(`${BASE}/posts/definitely-missing`)).status === 404)
  check('unknown twin is 404', (await fetch(`${BASE}/posts/definitely-missing.md`)).status === 404)
}

async function main() {
  const server = spawn('node_modules/.bin/next', ['start', '-p', String(PORT)], { stdio: 'ignore' })
  try {
    await waitForServer()
    await run()
  } finally {
    server.kill()
    await new Promise<void>((resolve) => {
      if (server.exitCode !== null || server.signalCode !== null) return resolve()
      const timer = setTimeout(() => {
        server.kill('SIGKILL')
        resolve()
      }, 5000)
      server.once('exit', () => {
        clearTimeout(timer)
        resolve()
      })
    })
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} smoke check(s) failed`)
    process.exit(1)
  }
  console.log('\nall smoke checks passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
