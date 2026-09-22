import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getSiteContent } from '@/shared/content'
import { Footer } from '@modules/footer'
import { Header } from '@modules/header'

import { UtmCapture } from '@/components/analytics/UtmCapture'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { CookieBanner } from '@/components/cookie/CookieBanner'
import { ModalHost } from '@/components/modal/ModalHost'
import { ScrollTop } from '@/components/scroll-top/ScrollTop'

export async function generateMetadata(): Promise<Metadata> {
  const { meta, contacts } = await getSiteContent()

  return {
    metadataBase: new URL(contacts.site),
    title: {
      default: meta.title,
      template: meta.titleTemplate
    },
    description: meta.description,
    applicationName: meta.applicationName,
    keywords: meta.keywords,
    authors: [{ name: meta.applicationName }],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: contacts.site,
      siteName: meta.applicationName,
      title: meta.title,
      description: meta.description
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large'
      }
    }
  }
}

export default async function SiteLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const content = await getSiteContent()

  return (
    <>
      <YandexMetrika />
      <UtmCapture />
      <div id="root">
        <Header header={content.header} contacts={content.contacts} />
        {children}
        <Footer />
      </div>

      <ModalHost
        modals={content.modals}
        forms={content.forms}
        contacts={content.contacts}
      />
      <CookieBanner />
      <ScrollTop />
      <BookingFlow />
      <div id="modal-root" />
    </>
  )
}
