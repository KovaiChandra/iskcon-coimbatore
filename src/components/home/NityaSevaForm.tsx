'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { inr } from '@/lib/format'

const MONTHLY_AMOUNTS = [501, 1001, 2501, 5001]

export function NityaSevaForm({ sevas }: { sevas: { slug: string; title: string }[] }) {
  const router = useRouter()
  const [seva, setSeva] = useState(sevas[0]?.slug ?? '')
  const [amount, setAmount] = useState(MONTHLY_AMOUNTS[1])

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault()
        router.push(`/donate/${seva}?amount=${amount}&frequency=monthly`)
      }}
    >
      <label className="sr-only" htmlFor="nitya-seva">Seva</label>
      <select id="nitya-seva" value={seva} onChange={(e) => setSeva(e.target.value)} className="rounded-full border-0 bg-white px-4 py-3 text-ink">
        {sevas.map((s) => (
          <option key={s.slug} value={s.slug}>{s.title}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor="nitya-amount">Monthly amount</label>
      <select id="nitya-amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-full border-0 bg-white px-4 py-3 text-ink">
        {MONTHLY_AMOUNTS.map((a) => (
          <option key={a} value={a}>{inr(a)} / month</option>
        ))}
      </select>
      <button type="submit" className="btn-donate py-3" disabled={!seva}>
        Start Monthly Seva
      </button>
    </form>
  )
}
