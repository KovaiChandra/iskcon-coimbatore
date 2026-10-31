import crypto from 'crypto'
import type { Payload } from 'payload'
import {
  type CheckoutItem,
  type GatewayCheckout,
  GatewayError,
  createCheckoutSession,
  gatewayEnabled,
  getCheckoutSession,
  pickContact,
  resolveContacts,
} from './kcm-gateway'
import { isSevaActive } from './sevas'

/** Public address of this site, used for the after-payment return page. */
export function siteUrl() {
  const url =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export type DonationInput = {
  seva: string
  amount: number
  item?: string
  frequency: 'one-time' | 'monthly'
  fullName: string
  mobile: string
  email: string
  pan?: string
  address?: string
  pin?: string
  occasion?: string
  consent?: boolean
}

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v)
const isMobile = (v: string) => /^[0-9+\-\s]{10,15}$/.test(v)

/** Trims and checks donor input. Returns the clean input, or a message to show the donor. */
export function validateDonation(raw: Record<string, unknown>):
  | { ok: true; input: DonationInput }
  | { ok: false; message: string; field?: string } {
  const s = (k: string) => String(raw[k] ?? '').trim()
  const input: DonationInput = {
    seva: s('seva'),
    amount: Math.round(Number(s('amount'))),
    item: s('item') || undefined,
    frequency: s('frequency') === 'monthly' ? 'monthly' : 'one-time',
    fullName: s('fullName'),
    mobile: s('mobile'),
    email: s('email').toLowerCase(),
    pan: s('pan').toUpperCase() || undefined,
    address: s('address') || undefined,
    pin: s('pin') || undefined,
    occasion: s('occasion') || undefined,
    consent: raw.consent === true || raw.consent === 'on' || raw.consent === 'true',
  }
  if (!input.seva) return { ok: false, field: 'seva', message: 'Please choose a seva.' }
  if (!Number.isFinite(input.amount) || input.amount < 1)
    return { ok: false, field: 'amount', message: 'Please choose or enter an amount.' }
  if (input.fullName.length < 3)
    return { ok: false, field: 'fullName', message: 'Please enter your full name.' }
  if (!isMobile(input.mobile))
    return { ok: false, field: 'mobile', message: 'Please enter a valid mobile number.' }
  if (!isEmail(input.email)) return { ok: false, field: 'email', message: 'Please enter a valid email.' }
  if (input.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(input.pan))
    return { ok: false, field: 'pan', message: 'Please check your PAN (e.g. ABCDE1234F), or leave it empty.' }
  return { ok: true, input }
}

export type StartedDonation = {
  reference: string
  amount: number
  frequency: DonationInput['frequency']
  name: string
  /** Pay online: open Razorpay checkout with exactly this object. Null → show UPI / bank details. */
  checkout: GatewayCheckout | null
  sessionId: string | null
  /** Why online payment is not available for this donation (shown to staff/app, not an error). */
  offlineReason?: string
}

/**
 * Saves the donation (Admin → Donations) and, when the seva has a gateway scheme ID,
 * opens a KCM gateway checkout session for it.
 */
export async function startDonation(
  payload: Payload,
  input: DonationInput,
  source: 'website' | 'app',
): Promise<{ ok: true; donation: StartedDonation } | { ok: false; status: number; message: string }> {
  const { docs } = await payload.find({
    collection: 'sevas',
    where: { slug: { equals: input.seva } },
    limit: 1,
    depth: 0,
  })
  const seva = docs[0]
  if (!seva || !isSevaActive(seva)) {
    return { ok: false, status: 404, message: 'This seva is no longer available.' }
  }

  const reference = `SEVA-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
  const donation = await payload.create({
    collection: 'donations',
    data: {
      fullName: input.fullName,
      mobile: input.mobile,
      email: input.email,
      pan: input.pan,
      address: input.address,
      pin: input.pin,
      occasion: input.occasion,
      frequency: input.frequency,
      consent: input.consent,
      amount: input.amount,
      seva: seva.id,
      status: 'created',
      source,
      reference,
    } as never,
  })

  const started: StartedDonation = {
    reference,
    amount: input.amount,
    frequency: input.frequency,
    name: input.fullName,
    checkout: null,
    sessionId: null,
  }

  const item = input.item ? (seva.items ?? []).find((i) => i.label === input.item) : undefined
  const line: CheckoutItem | null = item?.schemeId
    ? { scheme_id: item.schemeId, quantity: 1 }
    : seva.schemeId
      ? { scheme_id: seva.schemeId, quantity: 1, amount_rupees: input.amount }
      : null

  if (!gatewayEnabled()) return { ok: true, donation: { ...started, offlineReason: 'gateway_not_configured' } }
  if (!line) return { ok: true, donation: { ...started, offlineReason: 'seva_has_no_scheme_id' } }

  try {
    const { contacts } = await resolveContacts(
      {
        mobile: input.mobile,
        name: input.fullName,
        email: input.email,
        address: [input.address, input.pin].filter(Boolean).join(' '),
      },
      `contact-${reference}`,
    )
    const contact = pickContact(contacts, input.fullName)
    const session = await createCheckoutSession(
      {
        contactId: contact.contact_id,
        mobile: input.mobile,
        name: input.fullName,
        email: input.email,
        returnUrl: `${siteUrl()}/donate/thank-you?ref=${reference}`,
        items: [line],
        remarks: [
          reference,
          seva.title,
          input.frequency === 'monthly' ? 'Monthly Nitya Seva - first month' : null,
          input.occasion,
        ]
          .filter(Boolean)
          .join(' | '),
      },
      `checkout-${reference}`,
    )
    const amount = Math.round(session.order.amount / 100)
    await payload.update({
      collection: 'donations',
      id: donation.id,
      data: {
        kcmContactId: contact.contact_id,
        gatewaySessionId: session.session_id,
        razorpayOrderId: session.order.id,
        gatewayCheckout: session.checkout,
        amount,
      } as never,
    })
    return { ok: true, donation: { ...started, amount, checkout: session.checkout, sessionId: session.session_id } }
  } catch (err) {
    // The donation is saved either way; the donor can still pay by UPI / bank transfer.
    const code = err instanceof GatewayError ? `${err.status} ${err.code}: ${err.message}` : String(err)
    payload.logger.error(`KCM gateway: ${reference} could not start online payment (${code})`)
    await payload.update({
      collection: 'donations',
      id: donation.id,
      data: { failureReason: `Online payment unavailable: ${code}`.slice(0, 300) } as never,
    })
    return { ok: true, donation: { ...started, offlineReason: 'gateway_unavailable' } }
  }
}

export type DonationStatus = {
  reference: string
  status: 'created' | 'paid' | 'failed' | 'expired' | 'refunded'
  amount: number
  seva: string | null
  name: string
  receiptNo: string | null
  paymentId: string | null
  paidAt: string | null
  failureReason: string | null
  onlinePayment: boolean
}

/**
 * The donation's current status. While it is awaiting payment, asks the gateway (the only
 * source of truth) and saves what it says. Paid means status "paid" with a receipt number.
 */
export async function getDonationStatus(payload: Payload, reference: string): Promise<DonationStatus | null> {
  const { docs } = await payload.find({
    collection: 'donations',
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  let d = docs[0]
  if (!d) return null

  if (d.gatewaySessionId && d.status === 'created' && gatewayEnabled()) {
    try {
      const s = await getCheckoutSession(d.gatewaySessionId)
      const status = s.status === 'paid' && !s.receipt_id ? 'created' : s.status
      if (status !== 'created' || s.payment_id) {
        d = await payload.update({
          collection: 'donations',
          id: d.id,
          depth: 1,
          overrideAccess: true,
          data: {
            status,
            receiptNo: s.receipt_id ?? undefined,
            razorpayPaymentId: s.payment_id ?? undefined,
            paidAt: s.paid_at ?? undefined,
            failureReason: s.failure_reason ?? undefined,
            ...(status === 'paid' ? { amount: s.amount } : {}),
          } as never,
        })
      }
    } catch (err) {
      payload.logger.error(`KCM gateway: status check for ${reference} failed (${String(err)})`)
    }
  }

  return {
    reference,
    status: d.status as DonationStatus['status'],
    amount: d.amount,
    seva: typeof d.seva === 'object' && d.seva ? d.seva.title : null,
    name: d.fullName,
    receiptNo: d.receiptNo ?? null,
    paymentId: d.razorpayPaymentId ?? null,
    paidAt: d.paidAt ?? null,
    failureReason: d.failureReason ?? null,
    onlinePayment: Boolean(d.gatewaySessionId),
  }
}
