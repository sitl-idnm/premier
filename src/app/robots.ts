import type { MetadataRoute } from 'next'
import { CONTACTS } from '@/shared/const/contacts'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/'
    },
    sitemap: `${CONTACTS.site}/sitemap.xml`,
    host: CONTACTS.site
  }
}
