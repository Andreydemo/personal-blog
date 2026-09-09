const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2026-09-09T00:00:00.000Z" → "Sep 9, 2026" (always UTC, so builds are deterministic). */
export function formatDate(iso: string): string {
  return formatter.format(new Date(iso))
}

/** "2026-09-09T00:00:00.000Z" → "2026-09-09" */
export function isoDay(iso: string): string {
  return iso.slice(0, 10)
}
