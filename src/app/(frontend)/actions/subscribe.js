'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { checkForm } from '@/lib/spam'

export async function subscribe(_prev, formData) {
  const payload = await getPayloadClient()
  const blocked = await checkForm(payload, await headers(), formData, 'subscribe', {
    names: [formData.get('name')],
    texts: [],
  })
  if (blocked) return blocked

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim()
  const consent = formData.get('consent') === 'on'

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, message: 'Please enter your name and a valid email.' }
  }

  const existing = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (existing.docs.length === 0) {
    await payload.create({ collection: 'subscribers', data: { name, email, phone, consent } })
  }
  return { ok: true, message: 'Hare Krishna! You will hear from us before every festival.' }
}
