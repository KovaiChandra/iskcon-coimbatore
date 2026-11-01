import { PRIEST_MODES, PRIEST_TOPICS } from './enquiry-options'

/**
 * Checks a course registration or "speak to a priest" request (website form or app).
 * Returns { ok: true, data } ready for Admin → Enquiries, or { ok: false, message, field }.
 */
export function validateEnquiry(raw, source = 'website') {
  const s = (k) => String(raw[k] ?? '').trim()
  const type = s('type')
  const data = {
    type,
    name: s('name'),
    phone: s('phone'),
    email: s('email').toLowerCase() || undefined,
    preferredTime: s('preferredTime') || undefined,
    message: s('message') || undefined,
    consent: raw.consent === true || raw.consent === 'on' || raw.consent === 'true',
    source,
    ...(type === 'course' ? { course: s('course').slice(0, 200) } : {}),
    ...(type === 'priest'
      ? {
          topic: PRIEST_TOPICS.includes(s('topic')) ? s('topic') : 'Other',
          preferredMode: PRIEST_MODES.includes(s('preferredMode')) ? s('preferredMode') : undefined,
        }
      : {}),
  }
  if (type !== 'course' && type !== 'priest')
    return { ok: false, field: 'type', message: 'Unknown request type.' }
  if (type === 'course' && !data.course)
    return { ok: false, field: 'course', message: 'Please choose a course.' }
  if (data.name.length < 2) return { ok: false, field: 'name', message: 'Please enter your name.' }
  if (!/^[0-9+\-\s]{10,15}$/.test(data.phone))
    return { ok: false, field: 'phone', message: 'Please enter a valid phone number.' }
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
    return { ok: false, field: 'email', message: 'Please check your email, or leave it empty.' }
  if (type === 'priest' && !data.message)
    return { ok: false, field: 'message', message: 'Please tell us briefly what you would like to ask.' }
  return { ok: true, data }
}

export const ENQUIRY_THANKS = {
  course: 'Hare Krishna! You are registered. Our team will call you with the class details.',
  priest: 'Hare Krishna! Thank you. A temple priest will contact you to arrange a time.',
}
