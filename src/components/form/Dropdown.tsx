'use client'

import { FC, useRef, useState } from 'react'
import { useOnClickOutside } from '@/shared/hooks'
import classNames from 'classnames'

import styles from './Dropdown.module.scss'

type DropdownProps = {
  id?: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
}

export const Dropdown: FC<DropdownProps> = ({
  id,
  value,
  options,
  onChange,
  placeholder = 'Выберите вариант'
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(ref, () => setOpen(false))

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        id={id}
        className={classNames(styles.trigger, { [styles.open]: open })}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? undefined : styles.placeholder}>
          {value || placeholder}
        </span>
        <svg
          className={styles.caret}
          width="20"
          height="12"
          viewBox="0 0 20 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 2 10 10 18 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={classNames(styles.option, {
                [styles.selected]: opt === value
              })}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
              {opt === value && (
                <svg
                  className={styles.check}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10.5 8 14.5 16 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
