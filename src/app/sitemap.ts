import type { MetadataRoute } from 'next'
import { CONTACTS } from '@/shared/const/contacts'

// lastmod — дата последней содержательной правки страницы (не время сборки).
// При изменении страницы обновить дату здесь.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: CONTACTS.site,
      lastModified: '2026-10-22',
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${CONTACTS.site}/privacy`,
      lastModified: '2026-10-16',
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: `${CONTACTS.site}/consent`,
      lastModified: '2026-10-16',
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ]
}
