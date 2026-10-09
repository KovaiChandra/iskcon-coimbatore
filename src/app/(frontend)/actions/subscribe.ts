'use server'

import { getPayloadClient } from '@/lib/payload'

export type SubscribeState = { ok: boolean; message: string } | null

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim()
  const consent = formData.get('consent') === 'on'

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, message: 'Please enter your name and a valid email.' }
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1 })
  if (existing.docs.length === 0) {
    await payload.create({ collection: 'subscribers', data: { name, email, phone, consent } })
  }
  return { ok: true, message: 'Hare Krishna! You will hear from us before every festival.' }
}
