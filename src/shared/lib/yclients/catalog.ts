import type { PriceRow, PriceSalon, PriceSection, PriceTab } from '@/shared/content/prices'

import { yc } from './client'
import {
  companyId,
  isYclientsConfigured,
  SALON_KEYS,
  SALON_LABELS
} from './config'

type YcCategory = {
  id: number
  title: string
  parent_id: number
  weight?: number
}
type YcService = {
  id: number
  title: string
  category_id: number
  price_min: number
  price_max: number
  active?: number
}
type YcStaff = {
  id: number
  name: string
  specialization?: string
  position?: { title?: string } | null
  information?: string
  avatar?: string
  avatar_big?: string
  bookable?: boolean
  hidden?: number
  fired?: number
  weight?: number
}

export type Specialist = {
  id: number
  name: string
  specialization: string
  avatar: string
}
export type SalonStaff = { key: string; label: string; list: Specialist[] }

const CACHE = 3600 // services/staff change rarely → cache 1h

const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} ₽`
const price = (min: number, max: number) =>
  min === max ? rub(min) : `от ${rub(min)}`

/** Build our tab→section→row price tree from YClients categories + services. */
function servicesToTabs(cats: YcCategory[], svcs: YcService[]): PriceTab[] {
  const byId = new Map(cats.map((c) => [c.id, c]))
  const active = svcs.filter((s) => s.active !== 0)

  const byCat = new Map<number, YcService[]>()
  for (const s of active) {
    const arr = byCat.get(s.category_id) ?? []
    arr.push(s)
    byCat.set(s.category_id, arr)
  }

  const byWeightAsc = (a: YcCategory, b: YcCategory) =>
    (b.weight ?? 0) - (a.weight ?? 0)
  const childrenOf = (id: number) =>
    cats.filter((c) => c.parent_id === id).sort(byWeightAsc)

  // A root = category whose parent is not itself a category (virtual root).
  const roots = cats.filter((c) => !byId.has(c.parent_id)).sort(byWeightAsc)

  const collect = (id: number): YcService[] => {
    const own = byCat.get(id) ?? []
    const kids = childrenOf(id).flatMap((c) => collect(c.id))
    return [...own, ...kids]
  }
  const rows = (list: YcService[]): PriceRow[] =>
    list
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      .map((s) => ({ name: s.title, values: [price(s.price_min, s.price_max)] }))

  const tabs: PriceTab[] = []
  for (const root of roots) {
    const kids = childrenOf(root.id)
    const sections: PriceSection[] = []

    const own = byCat.get(root.id) ?? []
    if (own.length)
      sections.push({
        title: kids.length ? root.title : undefined,
        cols: ['Стоимость'],
        rows: rows(own)
      })

    for (const ch of kids) {
      const list = collect(ch.id)
      if (list.length)
        sections.push({ title: ch.title, cols: ['Стоимость'], rows: rows(list) })
    }

    if (sections.length)
      tabs.push({ key: String(root.id), label: root.title, sections })
  }
  return tabs
}

/** Live price list for both salons, or null when not configured / on error. */
export async function getLiveCatalog(): Promise<PriceSalon[] | null> {
  if (!isYclientsConfigured()) return null
  try {
    const salons = await Promise.all(
      SALON_KEYS.map(async (key) => {
        const id = companyId(key)
        if (!id) return null
        const data = await yc<{ category?: YcCategory[]; services?: YcService[] }>(
          `/book_services/${id}`,
          { revalidate: CACHE }
        )
        const tabs = servicesToTabs(data.category ?? [], data.services ?? [])
        if (!tabs.length) return null
        return { key, label: SALON_LABELS[key] ?? key, tabs } as PriceSalon
      })
    )
    const ok = salons.filter((s): s is PriceSalon => Boolean(s))
    return ok.length ? ok : null
  } catch {
    return null
  }
}

/** Bookable specialists per salon (empty array on error / not configured). */
export async function getSpecialists(): Promise<SalonStaff[]> {
  if (!isYclientsConfigured()) return []
  const salons = await Promise.all(
    SALON_KEYS.map(async (key) => {
      const id = companyId(key)
      if (!id) return { key, label: SALON_LABELS[key] ?? key, list: [] }
      try {
        const data = await yc<YcStaff[]>(`/book_staff/${id}`, { revalidate: CACHE })
        const list: Specialist[] = data
          .filter((s) => s.bookable !== false && !s.hidden && !s.fired)
          .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
          .map((s) => ({
            id: s.id,
            name: s.name,
            specialization: s.specialization || s.position?.title || '',
            avatar: s.avatar_big || s.avatar || ''
          }))
        return { key, label: SALON_LABELS[key] ?? key, list }
      } catch {
        return { key, label: SALON_LABELS[key] ?? key, list: [] }
      }
    })
  )
  return salons
}
