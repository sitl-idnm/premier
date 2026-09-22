import { yc } from './client'
import { companyId } from './config'

/**
 * YClients online-booking (book_*) helpers — build our own booking UI.
 * Only the partner token is required (no user token) for these endpoints.
 */

export type BookService = {
  id: number
  title: string
  category_id: number
  price_min: number
  price_max: number
  seance_length?: number
}
export type BookStaff = {
  id: number
  name: string
  specialization: string
  avatar: string
  rating: number
  votes: number
}
export type BookTime = { time: string; datetime: string; seance_length?: number }

type RawStaff = {
  id: number
  name: string
  specialization?: string
  position?: { title?: string } | null
  avatar?: string
  avatar_big?: string
  bookable?: boolean
  rating?: number
  votes_count?: number
}

const FRESH = 60 // availability changes often → short cache

/** Services bookable online for a salon (optionally narrowed to a staff member). */
export async function bookServices(
  salon: string,
  staffId?: number
): Promise<{ categories: { id: number; title: string }[]; services: BookService[] }> {
  const id = companyId(salon)
  const q = staffId ? `?staff_id=${staffId}` : ''
  const data = await yc<{
    category?: { id: number; title: string }[]
    services?: BookService[]
  }>(`/book_services/${id}${q}`, { revalidate: FRESH })
  return { categories: data.category ?? [], services: data.services ?? [] }
}

/** Staff who can perform the given service (or all bookable staff). */
export async function bookStaff(
  salon: string,
  serviceId?: number
): Promise<BookStaff[]> {
  const id = companyId(salon)
  const q = serviceId ? `?service_ids[]=${serviceId}` : ''
  const data = await yc<RawStaff[]>(`/book_staff/${id}${q}`, { revalidate: FRESH })
  return data
    .filter((s) => s.bookable !== false)
    .map((s) => ({
      id: s.id,
      name: s.name,
      specialization: s.specialization || s.position?.title || '',
      avatar: s.avatar_big || s.avatar || '',
      rating: s.rating ?? 0,
      votes: s.votes_count ?? 0
    }))
}

/** Dates that have free slots for a service/staff (YYYY-MM-DD strings). */
export async function bookDates(
  salon: string,
  serviceId: number,
  staffId: number
): Promise<string[]> {
  const id = companyId(salon)
  const data = await yc<{ booking_dates?: string[] }>(
    `/book_dates/${id}?service_ids[]=${serviceId}&staff_id=${staffId}`,
    { revalidate: 0 }
  )
  return data.booking_dates ?? []
}

/** Free time slots for a staff member on a date. staffId 0 = any master. */
export async function bookTimes(
  salon: string,
  staffId: number,
  date: string,
  serviceId: number
): Promise<BookTime[]> {
  const id = companyId(salon)
  return yc<BookTime[]>(
    `/book_times/${id}/${staffId}/${date}?service_ids[]=${serviceId}`,
    { revalidate: 0 }
  )
}

/** Send the SMS confirmation code required to create a booking. */
export async function sendCode(
  salon: string,
  phone: string,
  fullname: string
): Promise<void> {
  const id = companyId(salon)
  await yc(`/book_code/${id}`, {
    method: 'POST',
    body: { phone, fullname }
  })
}

export type CreateRecordInput = {
  salon: string
  phone: string
  fullname: string
  email?: string
  code: string
  comment?: string
  serviceId: number
  staffId: number
  datetime: string
}

/** Create the booking in YClients. Requires a valid SMS `code`. */
export async function createRecord(input: CreateRecordInput): Promise<unknown> {
  const id = companyId(input.salon)
  return yc(`/book_record/${id}`, {
    method: 'POST',
    body: {
      phone: input.phone,
      fullname: input.fullname,
      email: input.email ?? '',
      code: input.code,
      comment: input.comment ?? '',
      appointments: [
        {
          id: 0,
          services: [input.serviceId],
          staff_id: input.staffId,
          datetime: input.datetime
        }
      ]
    }
  })
}
