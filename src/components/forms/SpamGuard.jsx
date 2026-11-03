'use client'

import { useEffect, useRef } from 'react'
import styles from './Form.module.css'

/**
 * Put inside any public form. Adds a field hidden from people that bots fill in, and tells the
 * server how long the form was open (lib/spam.js rejects sends too fast to be a person).
 */
export function SpamGuard() {
  const ref = useRef(null)
  useEffect(() => {
    const form = ref.current?.form
    if (!form) return
    const openedAt = performance.now()
    const add = (e) => e.formData.set('_elapsed', String(Math.round(performance.now() - openedAt)))
    form.addEventListener('formdata', add)
    return () => form.removeEventListener('formdata', add)
  }, [])
  return (
    <input
      ref={ref}
      name="website"
      tabIndex={-1}
      autoComplete="off"
      className={styles.hp}
      aria-hidden
    />
  )
}
