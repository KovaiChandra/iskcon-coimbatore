'use server'

import { headers } from 'next/headers'
import { startDonation, validateDonation } from '@/lib/donations'
import { ENQUIRY_THANKS, validateEnquiry } from '@/lib/enquiries'
import { getPayloadClient } from '@/lib/payload'
import { allowAttempt, checkForm, TOO_MANY_MESSAGE } from '@/lib/spam'

const str = (formData, key) => String(formData.get(key) ?? '').trim()
const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v)
const isMobile = (v) => /^[0-9+\-\s]{10,15}$/.test(v)

/** Contact page form → Admin → Contact messages */
export async function sendContactMessage(_prev, formData) {
  const payload = await getPayloadClient()
  const blocked = await checkForm(payload, await headers(), formData, 'contact', {
    names: [str(formData, 'firstName'), str(formData, 'lastName')],
    texts: [str(formData, 'message')],
  })
  if (blocked) return blocked
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

  await payload.create({ collection: 'contact-messages', data })
  return {
    ok: true,
    message: 'Hare Krishna! Thank you for writing. We will reply within two days.',
  }
}

/** Volunteer page form → Admin → Volunteers */
export async function registerVolunteer(_prev, formData) {
  const payload = await getPayloadClient()
  const blocked = await checkForm(payload, await headers(), formData, 'volunteer', {
    names: [str(formData, 'name')],
    texts: [str(formData, 'skills'), str(formData, 'area'), str(formData, 'availability')],
  })
  if (blocked) return blocked
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

  await payload.create({ collection: 'volunteers', data })
  return {
    ok: true,
    message:
      'Hare Krishna! Thank you for offering your time. Our volunteer team will call you soon.',
  }
}

/**
 * Seva page form → Admin → Donations. When the seva has a gateway scheme ID, the result
 * carries a Razorpay `checkout` for the browser to open; otherwise the donor is shown
 * UPI / bank details and the temple team marks the donation as paid.
 */
export async function createDonation(_prev, formData) {
  const payload = await getPayloadClient()
  const blocked = await checkForm(payload, await headers(), formData, 'donation', {
    names: [str(formData, 'fullName')],
    texts: [str(formData, 'occasion'), str(formData, 'address')],
  })
  if (blocked) return blocked
  const checked = validateDonation(Object.fromEntries(formData))
  if (!checked.ok) return { ok: false, message: checked.message }
  // Each attempt can create a donor record at the gateway, so limit per mobile number too
  if (!(await allowAttempt(payload, 'donationMobile', checked.input.mobile.replace(/\D/g, '').slice(-10)))) {
    return { ok: false, message: TOO_MANY_MESSAGE }
  }
  const result = await startDonation(payload, checked.input, 'website')
  if (!result.ok) return { ok: false, message: result.message }
  return { ok: true, ...result.donation }
}

/** Course "Register" and "Speak to a priest" forms → Admin → Enquiries */
export async function sendEnquiry(_prev, formData) {
  const payload = await getPayloadClient()
  const blocked = await checkForm(payload, await headers(), formData, 'enquiry', {
    names: [str(formData, 'name')],
    texts: [str(formData, 'message'), str(formData, 'preferredTime')],
  })
  if (blocked) return blocked
  const checked = validateEnquiry(Object.fromEntries(formData), 'website')
  if (!checked.ok) return { ok: false, message: checked.message }
  await payload.create({ collection: 'enquiries', data: checked.data })
  return { ok: true, message: ENQUIRY_THANKS[checked.data.type] }
}
