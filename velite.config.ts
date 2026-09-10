import rehypeSlug from 'rehype-slug'
import { defineCollection, defineConfig, s } from 'velite'

export const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().min(1).max(110),
      description: s.string().min(50).max(160),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      tags: s
        .array(s.string().regex(KEBAB, 'tags must be lowercase kebab-case'))
        .min(1)
        .max(6),
      draft: s.boolean().default(false),
      cover: s.image().optional(),
      path: s.path(),
      metadata: s.metadata(),
      raw: s.raw(),
      html: s.markdown(),
      code: s.mdx({ rehypePlugins: [rehypeSlug] }),
      toc: s.toc({ maxDepth: 2 }),
    })
    .transform(({ path, ...data }) => ({ ...data, slug: path.replace(/^posts\//, '') }))
    .superRefine((post, ctx) => {
      if (!KEBAB.test(post.slug)) {
        ctx.addIssue({
          code: 'custom',
          message: `slug "${post.slug}" must be lowercase kebab-case; rename the file`,
        })
      }
      if (post.updatedAt && post.updatedAt < post.publishedAt) {
        ctx.addIssue({ code: 'custom', message: 'updatedAt must not be before publishedAt' })
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
})
