'use server'

import { startDonation, validateDonation } from '@/lib/donations'
import { ENQUIRY_THANKS, validateEnquiry } from '@/lib/enquiries'
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
 * Seva page form → Admin → Donations. When the seva has a gateway scheme ID, the result
 * carries a Razorpay `checkout` for the browser to open; otherwise the donor is shown
 * UPI / bank details and the temple team marks the donation as paid.
 */
export async function createDonation(_prev, formData) {
  if (isBot(formData)) return { ok: true }
  const checked = validateDonation(Object.fromEntries(formData))
  if (!checked.ok) return { ok: false, message: checked.message }
  const result = await startDonation(await getPayloadClient(), checked.input, 'website')
  if (!result.ok) return { ok: false, message: result.message }
  return { ok: true, ...result.donation }
}

/** Course "Register" and "Speak to a priest" forms → Admin → Enquiries */
export async function sendEnquiry(_prev, formData) {
  if (isBot(formData)) return { ok: true }
  const checked = validateEnquiry(Object.fromEntries(formData), 'website')
  if (!checked.ok) return { ok: false, message: checked.message }
  const payload = await getPayloadClient()
  await payload.create({ collection: 'enquiries', data: checked.data })
  return { ok: true, message: ENQUIRY_THANKS[checked.data.type] }
}
