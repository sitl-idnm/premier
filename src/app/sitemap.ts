import type { MetadataRoute } from 'next'
import { CONTACTS } from '@/shared/const/contacts'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: CONTACTS.site,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${CONTACTS.site}/rules`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4
    },
    {
      url: `${CONTACTS.site}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ]
}
