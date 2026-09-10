import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('content schema', () => {
  it('fails the content build when a post has invalid frontmatter', () => {
    expect(() =>
      execFileSync(
        'node_modules/.bin/velite',
        ['--config', 'tests/fixtures/invalid/velite.config.ts', '--strict', '--silent'],
        { stdio: 'pipe' },
      ),
    ).toThrow()
  })

  it.each(['unknown-tag', 'no-section'])('fails the content build for the %s fixture', (fixture) => {
    expect(() =>
      execFileSync(
        'node_modules/.bin/velite',
        ['--config', `tests/fixtures/${fixture}/velite.config.ts`, '--strict', '--silent'],
        { stdio: 'pipe' },
      ),
    ).toThrow()
  })

  it('passes on the real content', () => {
    expect(() =>
      execFileSync('node_modules/.bin/velite', ['--strict', '--silent'], { stdio: 'pipe' }),
    ).not.toThrow()
  })
})
