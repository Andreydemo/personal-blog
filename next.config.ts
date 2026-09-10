import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      { source: '/tags/ai-agents', destination: '/tags/agents', permanent: true },
      { source: '/tags/llm', destination: '/tags/ai', permanent: true },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        // /posts/<slug>.md → markdown twin
        { source: '/posts/:slug\\.md', destination: '/md/:slug' },
        // /posts/<slug> with Accept: text/markdown → markdown twin
        {
          source: '/posts/:slug',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
          destination: '/md/:slug',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
