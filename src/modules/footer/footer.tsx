import Link from 'next/link'
import { getSiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'
import { Logo } from '@ui/logo'

import styles from './footer.module.scss'

const Footer = async () => {
  const { footer } = await getSiteContent()

  return (
    <footer className={styles.root}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.logoLink} aria-label="Премьер">
          <Logo variant="dark" />
        </Link>

        <div className={styles.cols}>
          <div className={styles.col}>
            <span className={styles.text}>{footer.legalName}</span>
            {footer.legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {nbp(link.label)}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <span className={styles.text}>{footer.license}</span>
            <span className={styles.text}>{footer.licenseNumber}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
