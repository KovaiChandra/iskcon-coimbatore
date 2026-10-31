'use client'

import { useActionState } from 'react'
import { registerVolunteer } from '@/app/(frontend)/actions/forms'
import styles from './Form.module.css'

const INTERESTS = [
  'Festivals',
  'Prasadam / kitchen',
  'Annadaan',
  'Deity decoration',
  'Book distribution',
  'Goshala',
  'Photography & media',
  'Kovai Chandra construction',
]

export function VolunteerForm() {
  const [state, action, pending] = useActionState(registerVolunteer, null)

  if (state?.ok) {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>Thank you!</p>
        <p>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Full name</span>
          <input name="name" required autoComplete="name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Mobile</span>
          <input name="mobile" type="tel" required autoComplete="tel" className={styles.input} />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>
            Email <span className={styles.optional}>(optional)</span>
          </span>
          <input name="email" type="email" autoComplete="email" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Area in Coimbatore</span>
          <input name="area" placeholder="e.g. Peelamedu" className={styles.input} />
        </label>
      </div>
      <fieldset className={styles.field}>
        <legend className={styles.label}>I would like to help with</legend>
        <div className={styles.checks} style={{ marginTop: '0.4rem' }}>
          {INTERESTS.map((i) => (
            <label key={i} className={styles.checkChip}>
              <input type="checkbox" name="interest" value={i} />
              <span>{i}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span className={styles.label}>When are you free?</span>
        <select name="availability" className={styles.input} defaultValue="Weekends">
          <option>Weekends</option>
          <option>Weekday evenings</option>
          <option>Festival days only</option>
          <option>Flexible</option>
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>
          Skills or anything you&apos;d like us to know{' '}
          <span className={styles.optional}>(optional)</span>
        </span>
        <textarea name="skills" className={styles.input} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden />
      {state?.ok === false && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`btn-donate ${styles.submit}`}>
        {pending ? 'Sending…' : 'Join as a volunteer'}
      </button>
    </form>
  )
}
