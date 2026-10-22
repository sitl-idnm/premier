'use client'

import { FC } from 'react'
import { type SiteContent } from '@/shared/content/defaults'
import { GOALS, ymGoal } from '@/shared/lib/metrika'

import styles from './modal.module.scss'

type ThanksBodyProps = {
  modals: SiteContent['modals']
  contacts: SiteContent['contacts']
}

/** Ссылка на конкретную группу, а не заглушка вида «https://vk.com/». */
const isRealLink = (url: string) => {
  try {
    return new URL(url).pathname.replace(/\//g, '') !== ''
  } catch {
    return false
  }
}

/** Shared "заявка принята" body (used by both modals after submit). */
export const ThanksBody: FC<ThanksBodyProps> = ({ modals, contacts }) =>
  isRealLink(contacts.vk) ? (
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
  ) : null
