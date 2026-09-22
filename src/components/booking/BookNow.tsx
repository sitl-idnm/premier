'use client'

import { FC, ReactNode } from 'react'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { useSetAtom } from 'jotai'

type Props = {
  className?: string
  salon?: string
  serviceId?: number
  serviceName?: string
  staffId?: number
  staffName?: string
  children: ReactNode
}

/** Opens the custom booking flow, optionally pre-selecting salon/service/master. */
export const BookNow: FC<Props> = ({ className, children, ...ctx }) => {
  const open = useSetAtom(bookingAtom)
  return (
    <button
      type="button"
      className={className}
      onClick={() => open({ open: true, ...ctx })}
    >
      {children}
    </button>
  )
}
