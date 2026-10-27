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
// Self-hosted, subset of the client-provided .otf (fonts/MonomakhUnicode.otf):
// Latin, Latin-1, Cyrillic, punctuation, ₽, № → woff2 30 KB instead of 144 KB.
// Re-generate: pyftsubset MonomakhUnicode.otf --unicodes="U+0020-007E,U+00A0-00FF,
//   U+0400-045F,U+0490-0491,U+2000-206F,U+20BD,U+2116" --layout-features='*' --flavor=woff2
const monomakh = localFont({
  src: './fonts/MonomakhUnicode.woff2',
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
