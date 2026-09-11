import Link from 'next/link'

import { IconDoc } from '../../_components/icons'
import { GROUPS } from '../../_lib/groups'
import styles from '../../admin.module.scss'

export default function ContentDashboard() {
  return (
    <>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Контент сайта</h1>
        <Link href="/admin" className={styles.back}>
          ← К метрике
        </Link>
      </div>

      <div className={styles.grid}>
        {GROUPS.map((g) => (
          <Link key={g.id} href={`/admin/${g.id}`} className={styles.card}>
            <span className={styles.cardIcon}>
              <IconDoc width={20} height={20} />
            </span>
            <h3 className={styles.cardTitle}>{g.title}</h3>
            <p className={styles.cardDesc}>{g.desc}</p>
            <span className={styles.cardLink}>Редактировать →</span>
          </Link>
        ))}
      </div>
    </>
  )
}
