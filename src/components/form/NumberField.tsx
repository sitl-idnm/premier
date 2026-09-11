'use client'

import { FC } from 'react'

import styles from './numberField.module.scss'

type NumberFieldProps = {
  id?: string
  value: string
  placeholder?: string
  min?: number
  onChange: (value: string) => void
}

/**
 * Числовое поле с кастомными белыми стрелками без фона.
 * Нативный спиннер скрыт (Chrome + Firefox), стрелки — свои SVG.
 */
export const NumberField: FC<NumberFieldProps> = ({
  id,
  value,
  placeholder,
  min = 0,
  onChange
}) => {
  const step = (dir: 1 | -1) => {
    const current = value === '' ? min : parseInt(value, 10) || min
    onChange(String(Math.max(min, current + dir)))
  }

  return (
    <div className={styles.wrap}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />
      <span className={styles.arrows} aria-hidden="true">
        <button type="button" tabIndex={-1} onClick={() => step(1)}>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path
              d="M1 6l5-4.5L11 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" tabIndex={-1} onClick={() => step(-1)}>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path
              d="M1 1l5 4.5L11 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </span>
    </div>
  )
}
