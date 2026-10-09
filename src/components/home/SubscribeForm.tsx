'use client'

import { useActionState } from 'react'
import { subscribe, type SubscribeState } from '@/app/(frontend)/actions/subscribe'

export function SubscribeForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null)

  if (state?.ok) return <p className="rounded-2xl bg-white/10 p-5 text-center text-lg text-white">{state.message}</p>

  const input = 'w-full rounded-full border-0 bg-white px-4 py-3 text-ink placeholder:text-muted'
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="name" required placeholder="Name" aria-label="Name" className={input} />
        <input name="email" type="email" required placeholder="Email" aria-label="Email" className={input} />
        <input name="phone" type="tel" placeholder="Phone (optional)" aria-label="Phone" className={input} />
      </div>
      <label className="flex items-center justify-center gap-2 text-sm text-purple-100">
        <input type="checkbox" name="consent" className="size-4 accent-saffron-500" />
        I agree to receive festival updates on WhatsApp/SMS
      </label>
      {state && !state.ok && <p className="text-center text-sm text-saffron-300">{state.message}</p>}
      <div className="text-center">
        <button type="submit" disabled={pending} className="btn-donate px-8">
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
    </form>
  )
}
