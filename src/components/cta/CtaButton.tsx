'use client'

import { FC, ReactNode } from 'react'
import { modalAtom, ModalId } from '@/shared/atoms/modalAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { Button } from '@ui/button'
import { useSetAtom } from 'jotai'

type CtaButtonProps = {
  /** External link (YClients booking / certificates) — opens in a new tab. */
  href?: string
  /** Fallback: open a global modal when no href is given. */
  modal?: Exclude<ModalId, null>
  variant?: 'orange' | 'light'
  bordered?: boolean
  block?: boolean
  /** Where the button lives — sent to Метрика so clicks are attributable. */
  place?: string
  children: ReactNode
}

/** Client CTA: links out to YClients (href) or opens a modal. Server-safe. */
export const CtaButton: FC<CtaButtonProps> = ({
  href,
  modal,
  variant = 'orange',
  bordered,
  block,
  place,
  children
}) => {
  const setModal = useSetAtom(modalAtom)

  if (href) {
    return (
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noreferrer"
        variant={variant}
        bordered={bordered}
        block={block}
        onClick={() => ymGoal(GOALS.openBooking, place ? { place } : undefined)}
      >
        {children}
      </Button>
    )
  }

  const open = () => {
    ymGoal(GOALS.openBooking, place ? { place } : undefined)
    if (modal) setModal(modal)
  }

  return (
    <Button variant={variant} bordered={bordered} block={block} onClick={open}>
      {children}
    </Button>
  )
}
