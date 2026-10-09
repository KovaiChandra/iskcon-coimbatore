'use client'

import { useEffect, useState } from 'react'
import { templeStatus, type Session } from '@/lib/temple-status'

export function TempleStatus({ sessions }: { sessions: Session[] }) {
  // Computed on the client so cached pages still show the live status.
  const [status, setStatus] = useState<ReturnType<typeof templeStatus> | null>(null)

  useEffect(() => {
    const update = () => setStatus(templeStatus(sessions))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [sessions])

  if (!status || sessions.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${status.open ? 'bg-green-400' : 'bg-red-400'}`} />
      {status.label}
    </span>
  )
}
