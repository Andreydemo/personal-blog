import { describe, expect, it } from 'vitest'
import { robotsRules } from '@/lib/robots'
import { site } from '@/lib/site'

describe('robotsRules', () => {
  const robots = robotsRules(site)
  const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
  const agents = rules.flatMap((r) => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]))

  it('allows everyone and names every configured crawler explicitly', () => {
    expect(agents).toContain('*')
    for (const crawler of site.crawlers) expect(agents).toContain(crawler)
    for (const rule of rules) expect(rule.allow).toBe('/')
    for (const rule of rules) expect(rule).not.toHaveProperty('disallow')
  })

  it('points at the sitemap', () => {
    expect(robots.sitemap).toBe('https://andrii.korkoshko.com/sitemap.xml')
  })
})
