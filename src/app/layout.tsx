import { ReactNode } from 'react'
import type { Viewport } from 'next'
import localFont from 'next/font/local'
import { Inter } from 'next/font/google'

import '@styles/global.scss'

import { Provider } from '@service/provider'

// Body typeface — Inter (Figma: body/UI text 12–20px, weights 400–700).
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
})

// Heading typeface — Monomakh Unicode (Figma: uppercase display headings).
// Self-hosted from the client-provided .otf for exact metric match.
const monomakh = localFont({
  src: './fonts/MonomakhUnicode.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-monomakh',
  display: 'swap'
})

// Brand theme colour — «Премьер» off-white page background (Figma #FCFCFA).
export const viewport: Viewport = {
  themeColor: '#fcfcfa',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${monomakh.variable}`}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
