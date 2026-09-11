'use client'

import { FC, ReactNode, useRef } from 'react'
import { Portal } from '@/service/portal'
import {
  useFocusLock,
  useOnClickOutside,
  useOnEscKeydown,
  useScrollLock
} from '@/shared/hooks'
import { nbp } from '@/shared/lib/typography'

import styles from './modal.module.scss'

type ModalProps = {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export const Modal: FC<ModalProps> = ({
  title,
  subtitle,
  onClose,
  children
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useScrollLock()
  useFocusLock(rootRef)
  useOnClickOutside(contentRef, onClose)
  useOnEscKeydown(onClose)

  return (
    <Portal selector="#modal-root">
      <div ref={rootRef} className={styles.overlay}>
        <div
          ref={contentRef}
          className={styles.content}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className={styles.head}>
            <h2 className={styles.title}>{nbp(title)}</h2>
            {subtitle && <p className={styles.subtitle}>{nbp(subtitle)}</p>}
          </div>

          {children}
        </div>
      </div>
    </Portal>
  )
}
