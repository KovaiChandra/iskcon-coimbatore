'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Re-checks the payment every 4 seconds (for up to 2 minutes) while it is being confirmed. */
export function RefreshWhilePending() {
  const router = useRouter()
  useEffect(() => {
    let n = 0
    const t = setInterval(() => (++n > 30 ? clearInterval(t) : router.refresh()), 4000)
    return () => clearInterval(t)
  }, [router])
  return null
}

/** The gateway dropped our ?ref=: fall back to the reference this browser saved before paying. */
export function RememberedReference({ current }) {
  const router = useRouter()
  useEffect(() => {
    try {
      const ref = localStorage.getItem('lastSevaRef')
      if (ref && ref !== current) router.replace(`/donate/thank-you?ref=${ref}`)
    } catch {}
  }, [router, current])
  return null
}
