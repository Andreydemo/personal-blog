import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.bing ? { other: { 'msvalidate.01': site.verification.bing } } : {}),
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
