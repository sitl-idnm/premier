'use client'

import { FC, useEffect } from 'react'
import { captureUtm } from '@/shared/lib/utm'

/**
 * Snapshots UTM params from the landing URL into a cookie on first render, so
 * they survive in-page anchor navigation (which strips the query string) and
 * can be attached to every lead on submit. Renders nothing.
 */
export const UtmCapture: FC = () => {
  useEffect(() => {
    captureUtm()
  }, [])
  return null
}
