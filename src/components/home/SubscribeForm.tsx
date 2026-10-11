'use client'

import { useActionState } from 'react'
import { subscribe, type SubscribeState } from '@/app/(frontend)/actions/subscribe'
import styles from './SubscribeForm.module.css'

export function SubscribeForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null)

  if (state?.ok) return <p className={styles.success}>{state.message}</p>

  const input = styles.input
  return (
    <form action={action} className={styles.form}>
      <div className={styles.fields}>
        <input name="name" required placeholder="Name" aria-label="Name" className={input} />
        <input name="email" type="email" required placeholder="Email" aria-label="Email" className={input} />
        <input name="phone" type="tel" placeholder="Phone (optional)" aria-label="Phone" className={input} />
      </div>
      <label className={styles.consent}>
        <input type="checkbox" name="consent" className={styles.checkbox} />
        I agree to receive festival updates on WhatsApp/SMS
      </label>
      {state && !state.ok && <p className={styles.error}>{state.message}</p>}
      <div className={styles.center}>
        <button type="submit" disabled={pending} className={`btn-donate ${styles.submit}`}>
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
    </form>
  )
}
