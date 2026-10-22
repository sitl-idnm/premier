import type { Metadata } from 'next'

/** Превью для соцсетей 1200×630 (кадр из главного фото). */
export const OG_IMAGE = {
  url: '/images/og.jpg',
  width: 1200,
  height: 630,
  alt: 'Салон красоты «Премьер» в Москве'
}

/**
 * Соцмета страницы. openGraph/twitter в Next не сливаются с layout,
 * поэтому общие поля (картинка, локаль, имя сайта) задаём здесь целиком.
 */
export const socialMeta = (
  title: string,
  description: string,
  path: string
): Pick<Metadata, 'openGraph' | 'twitter'> => ({
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Премьер',
    url: path,
    title,
    description,
    images: [OG_IMAGE]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [OG_IMAGE.url]
  }
})
