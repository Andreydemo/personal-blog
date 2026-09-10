import { defineConfig } from 'velite'
import { posts } from '../../../velite.config'

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
})
