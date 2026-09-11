'use client'

import { FC, ReactNode } from 'react'
import { modalAtom, ModalId } from '@/shared/atoms/modalAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { Button } from '@ui/button'
import { useSetAtom } from 'jotai'

type CtaButtonProps = {
  modal: Exclude<ModalId, null>
  variant?: 'orange' | 'light'
  bordered?: boolean
  block?: boolean
  children: ReactNode
}

/** Client CTA that opens a global modal — usable inside server components. */
export const CtaButton: FC<CtaButtonProps> = ({
  modal,
  variant = 'orange',
  bordered,
  block,
  children
}) => {
  const setModal = useSetAtom(modalAtom)

  const open = () => {
    ymGoal(GOALS.openBooking)
    setModal(modal)
  }

  return (
    <Button variant={variant} bordered={bordered} block={block} onClick={open}>
      {children}
    </Button>
  )
}
