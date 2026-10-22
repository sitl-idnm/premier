import type { Metadata } from 'next'
import { getSiteContent } from '@/shared/content'
import { socialMeta } from '@/shared/lib/seo'

import { renderPolicyBody } from '../privacy/policyBody'
import styles from '../privacy/privacy.module.scss'

const title = 'Согласие на обработку персональных данных'
const description =
  'Согласие на обработку персональных данных салона красоты «Премьер».'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/consent' },
  ...socialMeta(`${title} — Премьер`, description, '/consent')
}

const ConsentPage = async () => {
  const { legal } = await getSiteContent()

  return (
    <main className={styles.root}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{legal.consentTitle}</h1>

        {legal.consentBlocks.map((block, i) => {
          const [head, ...rest] = block.split('\n')
          const body = rest.join('\n')

          return (
            <section key={i} className={styles.block}>
              <h2 className={styles.heading}>{head}</h2>
              {body && renderPolicyBody(body)}
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default ConsentPage
