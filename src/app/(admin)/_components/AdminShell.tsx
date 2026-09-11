'use client'

import { FC, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import styles from '../admin.module.scss'
import { Sidebar } from './Sidebar'

/** Wraps admin pages with the sidebar shell — except the standalone login screen. */
export const AdminShell: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname()

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
