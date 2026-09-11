import { getSiteContent } from '@/shared/content'

import { renderPolicyBody } from '../privacy/policyBody'
import styles from '../privacy/privacy.module.scss'

export const metadata = {
  title: 'Пользовательское соглашение',
  description:
    'Пользовательское соглашение салона красоты «Премьер».',
  alternates: { canonical: '/rules' }
}

const RulesPage = async () => {
  const { legal } = await getSiteContent()

  return (
    <main className={styles.root}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{legal.rulesTitle}</h1>

        {legal.rulesBlocks.map((block, i) => {
          const [head, ...rest] = block.split('\n')
          const body = rest.join('\n')

          return (
            <section key={i} className={styles.block}>
              <h2 className={styles.heading}>{head}</h2>
              {body && renderPolicyBody(body, { bulletLines: true })}
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default RulesPage
