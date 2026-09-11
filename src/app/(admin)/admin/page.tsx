import Link from 'next/link'
import { getSiteContent } from '@/shared/content'
import { getMetrikaStats } from '@/shared/lib/metrikaStat'

import { BarList } from '../_components/BarList'
import { CountUp } from '../_components/CountUp'
import { LineChart } from '../_components/LineChart'
import styles from '../admin.module.scss'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const content = await getSiteContent()
  const stats = await getMetrikaStats(content.metrika.counterId)

  return (
    <>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Метрика</h1>
        <Link href="/admin/content" className={styles.back}>
          Контент сайта →
        </Link>
      </div>
      <p className={styles.saveNote} style={{ marginBottom: 24 }}>
        Сводка за последние 30 дней. Счётчик №{stats.counterId ?? '—'}.
      </p>

      {!stats.configured && (
        <div className={styles.notice}>
          Графики появятся после подключения. Добавьте переменные окружения{' '}
          <b>YANDEX_METRIKA_OAUTH_TOKEN</b> и <b>YANDEX_METRIKA_COUNTER_ID</b>{' '}
          (OAuth-токен со скоупом <b>metrika:read</b> получите на oauth.yandex.ru),
          затем перезапустите приложение.
        </div>
      )}

      {stats.configured && stats.error && (
        <div className={styles.notice}>Не удалось получить данные: {stats.error}</div>
      )}

      {stats.configured && stats.totals && (
        <>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>
                <CountUp value={stats.totals.visits} delay={150} />
              </div>
              <div className={styles.statLabel}>визитов</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>
                <CountUp value={stats.totals.users} delay={280} />
              </div>
              <div className={styles.statLabel}>посетителей</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>
                <CountUp value={stats.totals.pageviews} delay={410} />
              </div>
              <div className={styles.statLabel}>просмотров</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardDark}`}>
              <div className={styles.statNum}>
                <CountUp
                  value={stats.totals.bounceRate}
                  decimals={1}
                  suffix="%"
                  delay={540}
                />
              </div>
              <div className={styles.statLabel}>отказы</div>
            </div>
          </div>

          <div className={styles.chartPanel}>
            <h3 className={styles.chartTitle}>Визиты и посетители по дням</h3>
            <LineChart series={stats.series ?? []} />
          </div>

          <div className={styles.panelGrid}>
            <div className={styles.chartPanel}>
              <h3 className={styles.chartTitle}>Цели (достижения за 30 дней)</h3>
              {stats.goals && stats.goals.length ? (
                <div className={styles.goalList}>
                  {stats.goals.map((g, i) => (
                    <div key={i} className={styles.goalRow}>
                      <span className={styles.goalName} title={g.name}>
                        {g.name}
                      </span>
                      <span className={styles.goalConv}>{g.conversion}%</span>
                      <span className={styles.goalNum}>
                        {g.reaches.toLocaleString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.saveNote}>Нет достижений целей за период.</p>
              )}
            </div>

            <div className={styles.chartPanel}>
              <h3 className={styles.chartTitle}>Источники трафика</h3>
              <BarList items={stats.sources ?? []} />
            </div>

            <div className={styles.chartPanel}>
              <h3 className={styles.chartTitle}>Устройства</h3>
              <BarList items={stats.devices ?? []} />
            </div>

            <div className={styles.chartPanel}>
              <h3 className={styles.chartTitle}>Популярные страницы</h3>
              <BarList items={stats.topPages ?? []} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
