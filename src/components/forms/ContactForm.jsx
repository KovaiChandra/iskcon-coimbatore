'use client'

import { useActionState } from 'react'
import { sendContactMessage } from '@/app/(frontend)/actions/forms'
import styles from './Form.module.css'

const CATEGORIES = ['General', 'Donation / 80G receipt', 'Seva', 'Volunteer', 'Suggestion', 'Other']

export function ContactForm({ defaultCategory = 'General' }) {
  const [state, action, pending] = useActionState(sendContactMessage, null)

  if (state?.ok) {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>Message sent</p>
        <p>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>First name</span>
          <input name="firstName" required autoComplete="given-name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Last name</span>
          <input name="lastName" required autoComplete="family-name" className={styles.input} />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Phone</span>
          <input name="phone" type="tel" required autoComplete="tel" className={styles.input} />
        </label>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>Topic</span>
        <select
          name="category"
          defaultValue={CATEGORIES.includes(defaultCategory) ? defaultCategory : 'General'}
          className={styles.input}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea name="message" required className={styles.input} />
      </label>
      <label className={styles.check}>
        <input type="checkbox" name="consent" />
        You may contact me on WhatsApp or phone about my message.
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden />
      {state?.ok === false && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`btn-primary ${styles.submit}`}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
