'use server'

import { getPayloadClient } from '@/lib/payload'

const str = (formData, key) => String(formData.get(key) ?? '').trim()
const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v)
const isMobile = (v) => /^[0-9+\-\s]{10,15}$/.test(v)
// Bots fill every field, including the hidden "website" one; people never see it.
const isBot = (formData) => str(formData, 'website') !== ''

/** Contact page form → Admin → Contact messages */
export async function sendContactMessage(_prev, formData) {
  if (isBot(formData)) return { ok: true }
  const data = {
    firstName: str(formData, 'firstName'),
    lastName: str(formData, 'lastName'),
    email: str(formData, 'email').toLowerCase(),
    phone: str(formData, 'phone'),
    category: str(formData, 'category') || 'General',
    message: str(formData, 'message'),
    consent: formData.get('consent') === 'on',
  }
  if (!data.firstName || !data.lastName || !data.message) {
    return { ok: false, message: 'Please fill in your name and message.' }
  }
  if (!isEmail(data.email)) return { ok: false, message: 'Please enter a valid email.' }
  if (!isMobile(data.phone)) return { ok: false, message: 'Please enter a valid phone number.' }

  const payload = await getPayloadClient()
  await payload.create({ collection: 'contact-messages', data })
  return {
    ok: true,
    message: 'Hare Krishna! Thank you for writing. We will reply within two days.',
  }
}

/** Volunteer page form → Admin → Volunteers */
export async function registerVolunteer(_prev, formData) {
  if (isBot(formData)) return { ok: true }
  const data = {
    name: str(formData, 'name'),
    mobile: str(formData, 'mobile'),
    email: str(formData, 'email').toLowerCase() || undefined,
    area: str(formData, 'area'),
    interest: formData.getAll('interest').map(String).join(', '),
    availability: str(formData, 'availability'),
    skills: str(formData, 'skills'),
  }
  if (!data.name) return { ok: false, message: 'Please enter your name.' }
  if (!isMobile(data.mobile)) return { ok: false, message: 'Please enter a valid mobile number.' }
  if (data.email && !isEmail(data.email)) return { ok: false, message: 'Please check your email.' }

  const payload = await getPayloadClient()
  await payload.create({ collection: 'volunteers', data })
  return {
    ok: true,
    message:
      'Hare Krishna! Thank you for offering your time. Our volunteer team will call you soon.',
  }
}

/**
 * Seva page form → Admin → Donations (status "created").
 * There is no online payment gateway yet: the donor then pays by UPI / bank transfer
 * and the temple team marks the donation as paid.
 */
export async function createDonation(_prev, formData) {
  if (isBot(formData)) return { ok: true }
  const slug = str(formData, 'seva')
  const amount = Math.round(Number(str(formData, 'amount')))
  const data = {
    fullName: str(formData, 'fullName'),
    mobile: str(formData, 'mobile'),
    email: str(formData, 'email').toLowerCase(),
    pan: str(formData, 'pan').toUpperCase() || undefined,
    address: str(formData, 'address') || undefined,
    pin: str(formData, 'pin') || undefined,
    occasion: str(formData, 'occasion') || undefined,
    frequency: str(formData, 'frequency') === 'monthly' ? 'monthly' : 'one-time',
    consent: formData.get('consent') === 'on',
    amount,
    status: 'created',
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return { ok: false, message: 'Please choose or enter an amount.' }
  }
  if (!data.fullName) return { ok: false, message: 'Please enter your full name.' }
  if (!isMobile(data.mobile)) return { ok: false, message: 'Please enter a valid mobile number.' }
  if (!isEmail(data.email)) return { ok: false, message: 'Please enter a valid email.' }
  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.pan)) {
    return { ok: false, message: 'Please check your PAN (e.g. ABCDE1234F), or leave it empty.' }
  }

  const payload = await getPayloadClient()
  const seva = await payload.find({
    collection: 'sevas',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  if (!seva.docs[0]) return { ok: false, message: 'This seva is no longer available.' }

  const donation = await payload.create({
    collection: 'donations',
    data: { ...data, seva: seva.docs[0].id },
  })
  return {
    ok: true,
    reference: `SEVA-${donation.id}`,
    amount,
    frequency: data.frequency,
    name: data.fullName,
  }
}
