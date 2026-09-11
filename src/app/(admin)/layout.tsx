import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { AdminShell } from './_components/AdminShell'

export const metadata: Metadata = {
  title: 'Панель управления — Премьер',
  robots: { index: false, follow: false }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
