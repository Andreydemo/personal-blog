export type TocEntry = { title: string; url: string; items: TocEntry[] }

/** A post shows a contents block once it has this many top-level sections. */
export const MIN_SECTIONS = 5

export function showToc(toc: TocEntry[]): boolean {
  return toc.length >= MIN_SECTIONS
}
