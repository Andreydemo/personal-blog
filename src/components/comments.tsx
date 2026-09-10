'use client'

import Giscus from '@giscus/react'
import { site } from '@/lib/site'

export function Comments() {
  const { repo, repoId, category, categoryId } = site.giscus
  if (!repoId || !repo.includes('/')) return null
  return (
    <section className="mt-16">
      <Giscus
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      />
    </section>
  )
}
