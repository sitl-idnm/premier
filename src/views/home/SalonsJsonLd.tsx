import { FC } from 'react'
import { type SiteContent } from '@/shared/content'

// Координаты — центр карты из ссылок виджетов Яндекса (ll=долгота,широта).
const geoFromMap = (src: string) => {
  const ll = new URL(src).searchParams.get('ll')?.split(',').map(Number)
  return ll && ll.length === 2 && ll.every(Number.isFinite)
    ? { '@type': 'GeoCoordinates', latitude: ll[1], longitude: ll[0] }
    : undefined
}

// «Ежедневно 10:00–22:00» → часы работы на все дни недели.
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]
const hoursFrom = (text: string) => {
  const m = /^Ежедневно\s+(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/.exec(text)
  return m
    ? {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS,
        opens: m[1],
        closes: m[2]
      }
    : undefined
}

/** schema.org BeautySalon для каждого салона (JSON-LD). */
const SalonsJsonLd: FC<{
  contacts: SiteContent['contacts']
  locations: SiteContent['locations']
}> = ({ contacts, locations }) => {
  const data = locations.items.map((item) => ({
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: `Премьер — салон красоты у м. ${item.metro}`,
    url: contacts.site,
    image: `${contacts.site}/images/og.jpg`,
    telephone: item.phone,
    email: contacts.email,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: item.address.replace(/,?\s*Москва$/, ''),
      addressLocality: 'Москва',
      addressCountry: 'RU'
    },
    geo: geoFromMap(item.mapSrc),
    openingHoursSpecification: hoursFrom(item.hours)
  }))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  )
}

export default SalonsJsonLd
