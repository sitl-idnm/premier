'use client'

import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef } from 'react'
import { formatRuPhone } from '@/shared/lib/phone'

type PhoneInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

const countDigits = (s: string): number => (s.match(/\d/g) || []).length

/** Caret index right after the `n`-th digit of `s` (n ≥ 1). */
function caretAfterNthDigit(s: string, n: number): number {
  if (n <= 0) return 0
  let seen = 0
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) {
      seen++
      if (seen === n) return i + 1
    }
  }
  return s.length
}

/**
 * Controlled phone field with a hard RU mask `+7 (999) 999-99-99`.
 *
 * `+7` is a fixed prefix (added on focus, restored if deleted). The caret is
 * preserved across re-formatting by counting digits, and Backspace over a
 * separator (space / `(` / `)` / `-`) deletes the preceding digit instead of
 * getting stuck.
 */
export const PhoneInput: FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '+7 (999) 999-99-99',
  required,
  className
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)

  // Restore the caret after React re-renders with the reformatted value.
  useEffect(() => {
    if (caret.current !== null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current)
      caret.current = null
    }
  })

  const emit = (raw: string, digitsBeforeCaret: number) => {
    const formatted = formatRuPhone(raw)
    caret.current = caretAfterNthDigit(formatted, digitsBeforeCaret)
    onChange(formatted)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const pos = e.target.selectionStart ?? raw.length
    const allDigits = raw.replace(/\D/g, '')
    // formatRuPhone prepends a `7` when there's no country code yet — account
    // for that extra leading digit so the caret math stays aligned.
    const prepended =
      allDigits && allDigits[0] !== '7' && allDigits[0] !== '8' ? 1 : 0
    emit(raw, countDigits(raw.slice(0, pos)) + prepended)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return
    const el = e.currentTarget
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start !== end || start === 0) return // let selections / start-of-field default through

    const v = el.value
    if (/\d/.test(v[start - 1])) return // deleting a digit — default behaviour is fine

    // Char before the caret is a separator: skip separators, drop the digit.
    let i = start - 1
    while (i >= 0 && !/\d/.test(v[i])) i--
    e.preventDefault()
    if (i < 0) return // nothing but the "+7 (" prefix — keep it
    emit(v.slice(0, i) + v.slice(start), countDigits(v.slice(0, i)))
  }

  const handleFocus = () => {
    if (!value) onChange('+7')
  }

  const handleBlur = () => {
    if (value === '+7') onChange('')
  }

  return (
    <input
      ref={ref}
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder}
      required={required}
      className={className}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}
