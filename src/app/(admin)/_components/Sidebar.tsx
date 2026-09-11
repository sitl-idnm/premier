'use client'

import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Logo } from '@ui/logo'

import { GROUPS } from '../_lib/groups'
import styles from '../admin.module.scss'
import { IconChart, IconDoc, IconGrid, IconLogout } from './icons'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export const Sidebar: FC = () => {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <aside className={styles.sidebar}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className={styles.brand}>
          <Logo />
          <span className={styles.brandSub}>панель</span>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/admin"
            className={cx(
              styles.navItem,
              pathname === '/admin' && styles.navItemActive
            )}
          >
            <IconChart className={styles.navIcon} />
            Метрика
          </Link>

          <Link
            href="/admin/content"
            className={cx(
              styles.navItem,
              pathname === '/admin/content' && styles.navItemActive
            )}
          >
            <IconGrid className={styles.navIcon} />
            Все разделы
          </Link>

          {GROUPS.map((g) => {
            const href = `/admin/${g.id}`
            return (
              <Link
                key={g.id}
                href={href}
                className={cx(
                  styles.navItem,
                  pathname === href && styles.navItemActive
                )}
              >
                <IconDoc className={styles.navIcon} />
                {g.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={styles.profile}>
        <span className={styles.avatar}>П</span>
        <div style={{ minWidth: 0 }}>
          <div className={styles.profileName}>Администратор</div>
          <div className={styles.profileRole}>Салон «Премьер»</div>
        </div>
        <button
          type="button"
          className={styles.logout}
          onClick={logout}
          aria-label="Выйти"
          title="Выйти"
        >
          <IconLogout width={16} height={16} />
        </button>
      </div>
    </aside>
  )
}
