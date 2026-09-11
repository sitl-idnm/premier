'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import { modalAtom } from '@/shared/atoms/modalAtom'
import { type SiteContent } from '@/shared/content/defaults'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { nbp } from '@/shared/lib/typography'
import { Logo } from '@ui/logo'
import classNames from 'classnames'
import { useSetAtom } from 'jotai'

import styles from './header.module.scss'

type HeaderProps = {
  header: SiteContent['header']
  contacts: SiteContent['contacts']
}

const Header: FC<HeaderProps> = ({ header }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const setModal = useSetAtom(modalAtom)
  const navLinks = header.nav

  const openBooking = () => {
    ymGoal(GOALS.openBooking)
    setModal('booking')
    setMenuOpen(false)
  }

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="Премьер">
          <Logo variant="dark" />
        </Link>

        <nav className={styles.navPill}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {nbp(link.label)}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={styles.cta}
          onClick={openBooking}
        >
          {header.ctaLabel}
        </button>

        <button
          className={classNames(styles.burger, {
            [styles.burgerOpen]: menuOpen
          })}
          aria-label="Меню"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {nbp(link.label)}
            </Link>
          ))}
          <button
            type="button"
            className={styles.mobileCta}
            onClick={openBooking}
          >
            {header.ctaLabel}
          </button>
        </nav>
      )}
    </header>
  )
}

export default Header
