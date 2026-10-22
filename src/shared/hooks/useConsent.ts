'use client'

import { useEffect, useState } from 'react'
import { type Consent, onConsentChange, readConsent } from '@/shared/lib/consent'

/** Текущее согласие на cookie; null — пользователь ещё не выбрал. */
export function useConsent() {
  const [consent, setConsent] = useState<Consent | null>(null)

  useEffect(() => {
    setConsent(readConsent())
    return onConsentChange(setConsent)
  }, [])

  return consent
}
