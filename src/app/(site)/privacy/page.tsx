import { getSiteContent } from '@/shared/content'

import { renderPolicyBody } from './policyBody'
import styles from './privacy.module.scss'

export const metadata = {
  title: 'Политика конфиденциальности',
  description:
    'Политика обработки персональных данных и пользовательское соглашение салона красоты «Премьер».',
  alternates: { canonical: '/privacy' }
}

const PrivacyPage = async () => {
  const { legal } = await getSiteContent()

  return (
    <main className={styles.root}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{legal.privacyTitle}</h1>

        {legal.privacyBlocks.map((block, i) => {
        const [head, ...rest] = block.split('\n')
        const body = rest.join('\n')
          const isPart = head.startsWith('Часть')

          return (
            <section key={i} className={styles.block}>
              <h2 className={isPart ? styles.part : styles.heading}>{head}</h2>
              {body && renderPolicyBody(body)}
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default PrivacyPage
