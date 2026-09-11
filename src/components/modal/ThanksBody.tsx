'use client'

import { FC } from 'react'
import { type SiteContent } from '@/shared/content/defaults'
import { GOALS, ymGoal } from '@/shared/lib/metrika'

import styles from './modal.module.scss'

type ThanksBodyProps = {
  modals: SiteContent['modals']
  contacts: SiteContent['contacts']
}

/** Shared "заявка принята" body (used by both modals after submit). */
export const ThanksBody: FC<ThanksBodyProps> = ({ modals, contacts }) => (
  <div className={styles.thanks}>
    <p className={styles.thanksPrompt}>{modals.thanksPrompt}</p>
    <a
      href={contacts.vk}
      target="_blank"
      rel="noreferrer"
      className={styles.subscribe}
      onClick={() => ymGoal(GOALS.clickVk)}
    >
      {modals.subscribeLabel}
    </a>
  </div>
)
