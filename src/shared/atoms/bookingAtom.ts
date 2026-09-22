import { atom } from 'jotai'

/** Booking modal state + optional pre-selection (from a service row / master card). */
export type BookingContext = {
  open: boolean
  salon?: string
  serviceId?: number
  serviceName?: string
  staffId?: number
  staffName?: string
}

export const bookingAtom = atom<BookingContext>({ open: false })
