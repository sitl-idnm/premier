import { cache } from 'react'
import {
  CONTENT_TAG,
  readContentOverride
} from '@/shared/lib/siteContentStore'

import { DEFAULT_CONTENT, type SiteContent } from './defaults'

export { CONTENT_TAG }

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Deep-merge an override tree over defaults. Objects merge key-by-key; arrays and
 * primitives from the override replace the default wholesale (the admin always
 * sends complete arrays for lists/tables).
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(base)) {
      out[k] = deepMerge((base as Record<string, unknown>)[k], override[k])
    }
    return out as T
  }
  return override as T
}

/**
 * Per-request memoised, fully-merged site content. The underlying Supabase read
 * is a tagged fetch (see siteContentStore) so pages stay static and revalidate
 * via revalidateTag(CONTENT_TAG) on save. Falls back to defaults on any error.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  let override: Record<string, unknown> = {}
  try {
    override = await readContentOverride()
  } catch (err) {
    console.error('[content] override load failed, using defaults:', err)
  }
  return deepMerge(DEFAULT_CONTENT as unknown as SiteContent, override)
})
