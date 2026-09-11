'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@ui/logo'

import styles from '../../admin.module.scss'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.replace('/admin')
      router.refresh()
    } else {
      const body = await res.json().catch(() => ({}))
      setErr(body.error || 'Неверный пароль')
      setLoading(false)
    }
  }

  return (
    <div className={styles.login}>
      <div className={styles.loginInner}>
        <Logo width={150} />
        <form className={styles.loginCard} onSubmit={submit}>
          <p className={styles.loginSub}>Введите пароль для доступа к панели</p>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoFocus
          />
          {err && <span className={styles.saveErr}>{err}</span>}
          <button className={styles.saveBtn} type="submit" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
