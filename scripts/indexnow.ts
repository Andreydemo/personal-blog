import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { site } from '../src/lib/site'
import { collectUrls, findIndexNowKey, parseNameStatus } from './indexnow-lib'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

async function waitUntilLive(url: string) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' }).catch(() => null)
    if (res?.status === 200) return
    await new Promise((resolve) => setTimeout(resolve, 20_000))
  }
  throw new Error(`indexnow: ${url} not live after 10 minutes`)
}

async function main() {
  const beforeEnv = process.env.BEFORE_SHA ?? ''
  const before = beforeEnv && !/^0+$/.test(beforeEnv) ? beforeEnv : 'HEAD~1'
  const after = process.env.AFTER_SHA || 'HEAD'

  const diff = execFileSync('git', ['diff', '--name-status', before, after, '--', 'content/posts'], {
    encoding: 'utf8',
  })
  const { urls, added } = collectUrls(parseNameStatus(diff), site.url, (file) => readFileSync(file, 'utf8'))
  if (urls.length === 0) {
    console.log('indexnow: no published post changes')
    return
  }

  const key = findIndexNowKey(readdirSync('public'))
  if (!key) throw new Error('indexnow: no <key>.txt in public/')

  for (const url of added) await waitUntilLive(url)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(site.url).host,
      key,
      keyLocation: `${site.url}/${key}.txt`,
      urlList: urls,
    }),
  })
  console.log(`indexnow: HTTP ${res.status} for ${urls.length} url(s)\n${urls.join('\n')}`)
  if (!res.ok) throw new Error(`indexnow: ${res.status} ${await res.text()}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
