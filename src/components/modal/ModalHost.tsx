'use client'

import { FC } from 'react'
import { type SiteContent } from '@/shared/content/defaults'
import { modalAtom } from '@/shared/atoms/modalAtom'
import { useAtom } from 'jotai'

import { BookingModal } from './BookingModal'

export type ModalContent = {
  modals: SiteContent['modals']
  forms: SiteContent['forms']
  contacts: SiteContent['contacts']
}

export const ModalHost: FC<ModalContent> = ({ modals, forms, contacts }) => {
  const [modal, setModal] = useAtom(modalAtom)
  const close = () => setModal(null)

  if (modal === 'booking')
    return (
      <BookingModal
        onClose={close}
        modals={modals}
        forms={forms}
        contacts={contacts}
      />
    )
  return null
}
