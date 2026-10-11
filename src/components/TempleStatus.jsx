'use client'

import { useEffect, useState } from 'react'
import { templeStatus } from '@/lib/temple-status'
import styles from './TempleStatus.module.css'

export function TempleStatus({ sessions }) {
  // Computed on the client so cached pages still show the live status.
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const update = () => setStatus(templeStatus(sessions))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [sessions])

  if (!status || sessions.length === 0) return null
  return (
    <span className={styles.status}>
      <span className={`${styles.dot} ${status.open ? styles.open : styles.closed}`} />
      {status.label}
    </span>
  )
}
