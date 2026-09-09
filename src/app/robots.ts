import type { MetadataRoute } from 'next'
import { robotsRules } from '@/lib/robots'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return robotsRules(site)
}
