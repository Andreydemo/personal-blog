export type Change = { status: 'A' | 'M' | 'D'; file: string }

/** Parses `git diff --name-status` output. A rename becomes a delete of the old path plus an add of the new one. */
export function parseNameStatus(output: string): Change[] {
  const changes: Change[] = []
  for (const line of output.split('\n')) {
    if (line.trim() === '') continue
    const [status, ...paths] = line.split('\t')
    const kind = status[0]
    if (kind === 'R') {
      changes.push({ status: 'D', file: paths[0] }, { status: 'A', file: paths[1] })
    } else if (kind === 'A' || kind === 'M' || kind === 'D') {
      changes.push({ status: kind, file: paths[0] })
    }
  }
  return changes
}

export function slugFromFile(file: string): string | null {
  const match = /^content\/posts\/([^/]+)\.mdx$/.exec(file)
  return match ? match[1] : null
}

/** True when the frontmatter block (between the first two `---` lines) contains `draft: true`. */
export function isDraftSource(source: string): boolean {
  const normalized = source.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---/.exec(normalized)
  return match ? /^draft:\s*["']?true["']?\s*$/m.test(match[1]) : false
}

export function findIndexNowKey(files: string[]): string | null {
  const file = files.find((name) => /^[a-f0-9]{32}\.txt$/.test(name))
  return file ? file.slice(0, -'.txt'.length) : null
}

export function collectUrls(
  changes: Change[],
  baseUrl: string,
  readSource: (file: string) => string,
): { urls: string[]; added: string[] } {
  const urls: string[] = []
  const added: string[] = []
  for (const change of changes) {
    const slug = slugFromFile(change.file)
    if (!slug) continue
    if (change.status !== 'D' && isDraftSource(readSource(change.file))) continue
    const url = `${baseUrl}/posts/${slug}`
    if (!urls.includes(url)) urls.push(url)
    if (change.status === 'A') added.push(url)
  }
  return { urls, added }
}
