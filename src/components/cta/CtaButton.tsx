'use client'

import { FC, ReactNode } from 'react'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { Button } from '@ui/button'
import { useSetAtom } from 'jotai'

type CtaButtonProps = {
  /** External link (e.g. certificates) — opens in a new tab. */
  href?: string
  /** Open the custom booking flow (optionally pre-selecting a salon). */
  booking?: boolean
  salon?: string
  variant?: 'orange' | 'light'
  bordered?: boolean
  block?: boolean
  /** Where the button lives — sent to Метрика so clicks are attributable. */
  place?: string
  children: ReactNode
}

/** Client CTA: opens booking flow, links out (href), or both. Server-safe. */
export const CtaButton: FC<CtaButtonProps> = ({
  href,
  booking,
  salon,
  variant = 'orange',
  bordered,
  block,
  place,
  children
}) => {
  const openBooking = useSetAtom(bookingAtom)

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
    if (booking) openBooking({ open: true, salon })
  }

  return (
    <Button variant={variant} bordered={bordered} block={block} onClick={open}>
      {children}
    </Button>
  )
}
