'use client'

import { useActionState, useRef } from 'react'
import { sendEnquiry } from '@/app/(frontend)/actions/forms'
import { PRIEST_MODES, PRIEST_TOPICS } from '@/lib/enquiry-options'
import { SpamGuard } from './SpamGuard'
import styles from './Form.module.css'

/**
 * A button that opens a short form in a pop-up: register for a course (type="course", course=name)
 * or ask to speak to a priest (type="priest"). Saved to Admin → Enquiries.
 */
export function EnquiryButton({ type, course, label, className, children }) {
  const dialog = useRef(null)
  const [state, action, pending] = useActionState(sendEnquiry, null)
  const title = type === 'course' ? `Register: ${course}` : 'Speak to a priest'

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {children ?? label}
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={title}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <div className={styles.dialogBody}>
          <button
            type="button"
            className={styles.dialogClose}
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
          <p className={styles.dialogTitle}>{title}</p>

          {state?.ok ? (
            <div className={styles.success} role="status">
              <p className={styles.successTitle}>Thank you</p>
              <p>{state.message}</p>
            </div>
          ) : (
            <form action={action} className={styles.form}>
              <input type="hidden" name="type" value={type} />
              {type === 'course' && <input type="hidden" name="course" value={course} />}
              <div className={styles.row}>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input name="name" required autoComplete="name" className={styles.input} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Phone</span>
                  <input name="phone" type="tel" required autoComplete="tel" className={styles.input} />
                </label>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>
                  Email <span className={styles.optional}>(optional)</span>
                </span>
                <input name="email" type="email" autoComplete="email" className={styles.input} />
              </label>

              {type === 'priest' && (
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span className={styles.label}>Topic</span>
                    <select name="topic" className={styles.input} defaultValue={PRIEST_TOPICS[0]}>
                      {PRIEST_TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>How would you like to speak?</span>
                    <select name="preferredMode" className={styles.input} defaultValue={PRIEST_MODES[0]}>
                      {PRIEST_MODES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className={styles.field}>
                <span className={styles.label}>
                  Best time to reach you <span className={styles.optional}>(optional)</span>
                </span>
                <input name="preferredTime" placeholder="e.g. Weekday evenings" className={styles.input} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>
                  {type === 'priest' ? 'Your question or what you would like to discuss' : 'Anything we should know'}
                  {type === 'course' && <span className={styles.optional}> (optional)</span>}
                </span>
                <textarea name="message" required={type === 'priest'} className={styles.input} />
              </label>
              <label className={styles.check}>
                <input type="checkbox" name="consent" />
                Send me updates on WhatsApp and SMS.
              </label>
              <SpamGuard />
              {state?.ok === false && (
                <p className={styles.error} role="alert">
                  {state.message}
                </p>
              )}
              <button type="submit" disabled={pending} className={`btn-donate ${styles.submit}`}>
                {pending ? 'Sending…' : type === 'course' ? 'Register' : 'Send request'}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  )
}
