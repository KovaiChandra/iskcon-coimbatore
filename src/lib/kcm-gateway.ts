/**
 * KCM Payment Gateway (ISKCON Coimbatore IT): donor lookup, Razorpay checkout sessions and
 * authoritative payment status. Docs: https://www.iskconcoimbatore.com/api/kcm-payment-gateway/docs
 * The secret stays on the server; browsers and the mobile app only ever see the `checkout` object.
 */

const BASE_URL = (
  process.env.KCM_PAYMENT_GATEWAY_URL || 'https://iskconcoimbatore.com/api/kcm-payment-gateway'
).replace(/\/$/, '')

export type GatewayContact = {
  contact_id: string
  first_Name: string
  last_Name?: string
  email?: string
  mobileNo: string
}

export type GatewayCheckout = {
  key_id: string
  amount: number
  currency: 'INR'
  order_id: string
  name?: string
  description?: string
  image?: string
  prefill?: { name?: string; contact?: string; email?: string }
  callback_url: string
  redirect?: boolean
}

export type GatewaySessionStatus = {
  session_id: string
  status: 'created' | 'paid' | 'failed' | 'expired'
  amount: number
  order_id: string
  receipt_id: string | null
  payment_id: string | null
  failure_reason: string | null
  paid_at: string | null
  expires_at: string
}

export class GatewayError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export const gatewayEnabled = () => Boolean(process.env.KCM_PAYMENT_GATEWAY_SECRET)

/** Indian mobile → last 10 digits, as the gateway normalises it. */
export const normaliseMobile = (mobile: string) => mobile.replace(/\D/g, '').slice(-10)

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown, idempotencyKey?: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.KCM_PAYMENT_GATEWAY_SECRET}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new GatewayError(res.status, json.error ?? 'gateway_error', json.message ?? json.error ?? 'Payment gateway error')
  }
  return json as T
}

/** All contacts on this mobile (a family may share one); creates one when none match. */
export async function resolveContacts(
  input: { mobile: string; name?: string; email?: string; address?: string },
  idempotencyKey: string,
) {
  const res = await call<{ contacts: GatewayContact[]; matched: boolean }>(
    'POST',
    '/contacts/resolve',
    {
      mobileNo: normaliseMobile(input.mobile),
      ...(input.name ? { first_Name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.address ? { address: input.address.slice(0, 500) } : {}),
    },
    idempotencyKey,
  )
  return res
}

/** The contact whose name best matches what the donor typed, else the first one. */
export function pickContact(contacts: GatewayContact[], name: string) {
  const n = name.trim().toLowerCase()
  const full = (c: GatewayContact) => `${c.first_Name} ${c.last_Name ?? ''}`.trim().toLowerCase()
  return (
    contacts.find((c) => full(c) === n) ??
    contacts.find((c) => c.first_Name.trim().toLowerCase() === n.split(/\s+/)[0]) ??
    contacts[0]
  )
}

export type CheckoutItem = { scheme_id: string; quantity: number; amount_rupees?: number }

export async function createCheckoutSession(
  input: {
    contactId: string
    mobile: string
    name: string
    email?: string
    returnUrl: string
    items: CheckoutItem[]
    remarks?: string
  },
  idempotencyKey: string,
) {
  return call<{ session_id: string; order: { id: string; amount: number }; checkout: GatewayCheckout }>(
    'POST',
    '/checkout/sessions',
    {
      contact_id: input.contactId,
      mobileNo: normaliseMobile(input.mobile),
      first_Name: input.name.slice(0, 120),
      email: input.email ?? '',
      return_url: input.returnUrl,
      items: input.items,
      ...(input.remarks ? { remarks: input.remarks.slice(0, 500) } : {}),
    },
    idempotencyKey,
  )
}

export const getCheckoutSession = (sessionId: string) =>
  call<GatewaySessionStatus>('GET', `/checkout/sessions/${encodeURIComponent(sessionId)}`)
