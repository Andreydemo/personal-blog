import { describe, expect, it } from 'vitest'
import { formatDate, isoDay } from '@/lib/dates'

describe('dates', () => {
  it('formats an ISO timestamp as a readable UTC date', () => {
    expect(formatDate('2026-09-09T00:00:00.000Z')).toBe('Sep 9, 2026')
  })

  it('keeps the calendar day stable regardless of local timezone', () => {
    expect(formatDate('2026-12-31T23:30:00.000Z')).toBe('Dec 31, 2026')
  })

  it('returns the YYYY-MM-DD part', () => {
    expect(isoDay('2026-09-09T00:00:00.000Z')).toBe('2026-09-09')
  })
})
