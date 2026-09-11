'use client'

import { FC, FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { submitLead } from '@/shared/lib/leads'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { isCompleteRuPhone } from '@/shared/lib/phone'
import { Button } from '@ui/button'

import { PhoneInput } from '@/components/form/PhoneInput'
import {
  SmartCaptcha,
  type SmartCaptchaHandle
} from '@/components/form/SmartCaptcha'

import { Modal } from './Modal'
import styles from './modal.module.scss'
import { type ModalContent } from './ModalHost'
import { ThanksBody } from './ThanksBody'

export const BookingModal: FC<{ onClose: () => void } & ModalContent> = ({
  onClose,
  modals,
  forms,
  contacts
}) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [submitted, setSubmitted] = useState(false)
  const captchaRef = useRef<SmartCaptchaHandle>(null)

  const canSubmit = name.trim() !== '' && isCompleteRuPhone(phone) && agree

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || status === 'loading') return

    setStatus('loading')

    let captchaToken = ''
    try {
      captchaToken = (await captchaRef.current?.execute()) ?? ''
    } catch {
      ymGoal(GOALS.submitError, { form: 'booking' })
      setStatus('error')
      return
    }

    const res = await submitLead({ form: 'booking', name, phone, captchaToken })

    if (res.ok) {
      ymGoal(GOALS.submitBooking)
      setSubmitted(true)
    } else {
      ymGoal(GOALS.submitError, { form: 'booking' })
      setStatus('error')
    }
  }

  if (submitted) {
    return (
      <Modal
        title={modals.thanksTitle}
        subtitle={modals.thanksSubtitle}
        onClose={onClose}
      >
        <ThanksBody modals={modals} contacts={contacts} />
      </Modal>
    )
  }

  return (
    <Modal title={modals.bookingTitle} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="b-name">{forms.nameLabel}</label>
          <input
            id="b-name"
            type="text"
            placeholder={forms.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="b-phone">{forms.phoneLabel}</label>
          <PhoneInput id="b-phone" value={phone} onChange={setPhone} required />
        </div>

        <label className={styles.consent}>
          <input
            type="checkbox"
            required
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            {forms.consentPrefix}
            <Link href="/privacy">{forms.consentLink}</Link>
            {forms.consentSuffix}
          </span>
        </label>

        {status === 'error' && <p className={styles.error}>{forms.error}</p>}

        <SmartCaptcha ref={captchaRef} />

        <Button
          variant="orange"
          block
          type="submit"
          disabled={!canSubmit || status === 'loading'}
        >
          {status === 'loading' ? forms.sending : forms.submitBooking}
        </Button>
      </form>
    </Modal>
  )
}
