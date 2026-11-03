'use client'

import { useActionState, useEffect, useRef } from 'react'
import { sendContactMessage } from '@/app/(frontend)/actions/forms'
import { SpamGuard } from './SpamGuard'
import styles from './Form.module.css'

const CATEGORIES = ['General', 'Donation / 80G receipt', 'Seva', 'Volunteer', 'Suggestion', 'Other']

/** Topic is preselected from ?topic= in the address (read here so the page itself stays cached). */
export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, null)
  const topicRef = useRef(null)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('topic')
    if (t && CATEGORIES.includes(t) && topicRef.current) topicRef.current.value = t
  }, [])

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
          ref={topicRef}
          defaultValue="General"
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
      <SpamGuard />
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
