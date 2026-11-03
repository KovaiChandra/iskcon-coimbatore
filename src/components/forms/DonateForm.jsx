'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { useActionState, useEffect, useState } from 'react'
import { createDonation } from '@/app/(frontend)/actions/forms'
import { inr, waLink } from '@/lib/format'
import { SpamGuard } from './SpamGuard'
import styles from './Form.module.css'

/** Opens Razorpay checkout with the gateway's checkout object, unchanged. */
export function openCheckout(checkout, onDismiss) {
  const { key_id, ...rest } = checkout
  const rzp = new window.Razorpay({ ...rest, key: key_id, modal: { ondismiss: onDismiss } })
  rzp.open()
}

/**
 * Seva donation form. Saves the donation (Admin → Donations). When the seva is set up on the
 * KCM payment gateway, Razorpay opens to pay online and the donor returns to /donate/thank-you.
 * Otherwise it shows how to pay: UPI (ID, QR, "Pay by UPI app" link) and bank details from
 * Site settings → Donations, plus a WhatsApp button to send the reference to the temple.
 */
export function DonateForm({ seva, initialAmount, initialFrequency, pay }) {
  const amounts = seva.amounts.length > 0 ? seva.amounts : [501, 1001, 2501]
  const [amount, setAmount] = useState(initialAmount || amounts[0])
  const [frequency, setFrequency] = useState(
    initialFrequency === 'monthly' && seva.allowMonthly ? 'monthly' : 'one-time',
  )
  const [selectedItem, setSelectedItem] = useState(null)
  const [state, action, pending] = useActionState(createDonation, null)
  const [razorpayReady, setRazorpayReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const checkout = state?.ok ? state.checkout : null

  useEffect(() => {
    if (!checkout || !razorpayReady) return
    try {
      localStorage.setItem('lastSevaRef', state.reference)
    } catch {}
    openCheckout(checkout, () => setDismissed(true))
  }, [checkout, razorpayReady, state?.reference])

  if (checkout) {
    return (
      <div className={styles.success} role="status">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          onReady={() => setRazorpayReady(true)}
        />
        <p className={styles.successTitle}>
          {dismissed ? 'Payment not completed' : 'Opening secure payment…'}
        </p>
        <p>
          Your seva of <strong>{inr(state.amount)}</strong> for {seva.title}. Reference:{' '}
          <strong>{state.reference}</strong>.
        </p>
        {dismissed && (
          <div className={styles.payButtons}>
            <button
              type="button"
              className="btn-donate"
              onClick={() => {
                setDismissed(false)
                openCheckout(checkout, () => setDismissed(true))
              }}
            >
              Pay {inr(state.amount)} now
            </button>
          </div>
        )}
      </div>
    )
  }

  if (state?.ok && state.reference) {
    const note = `${seva.title} ${state.reference}`
    const upiLink = pay.upiId
      ? `upi://pay?pa=${encodeURIComponent(pay.upiId)}&pn=${encodeURIComponent('ISKCON Coimbatore')}&am=${state.amount}&cu=INR&tn=${encodeURIComponent(note)}`
      : null
    const waText = `Hare Krishna! I have offered ${inr(state.amount)}${state.frequency === 'monthly' ? ' per month' : ''} for ${seva.title}. Reference: ${state.reference}. Name: ${state.name}.`
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>Thank you, {state.name}!</p>
        <p>
          Your seva of <strong>{inr(state.amount)}</strong>
          {state.frequency === 'monthly' ? ' per month' : ''} for {seva.title} is noted. Reference:{' '}
          <strong>{state.reference}</strong>.
        </p>
        <div className={styles.pay}>
          {pay.upiId && (
            <div className={styles.payBox}>
              <p className={styles.payLabel}>Pay by UPI</p>
              <p className={styles.payValue}>{pay.upiId}</p>
              {pay.upiQr && (
                <div className={styles.qr}>
                  <Image src={pay.upiQr} alt="UPI QR code" fill sizes="176px" />
                </div>
              )}
            </div>
          )}
          {pay.bankDetails && (
            <div className={styles.payBox}>
              <p className={styles.payLabel}>Bank transfer</p>
              <p className={styles.payValue}>{pay.bankDetails}</p>
            </div>
          )}
          {!pay.upiId && !pay.bankDetails && (
            <p>Our seva team will call you shortly with the payment details.</p>
          )}
          <div className={styles.payButtons}>
            {upiLink && (
              <a href={upiLink} className="btn-donate">
                Pay {inr(state.amount)} by UPI app
              </a>
            )}
            {pay.whatsapp && (
              <a
                href={waLink(pay.whatsapp, waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Confirm on WhatsApp
              </a>
            )}
          </div>
          <p style={{ fontSize: '0.875rem' }}>
            Please mention the reference with your payment. Your 80G receipt is sent once the
            payment is received.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="seva" value={seva.slug} />
      <input type="hidden" name="frequency" value={frequency} />
      {selectedItem && <input type="hidden" name="item" value={selectedItem} />}

      {seva.allowMonthly && (
        <div className={styles.field}>
          <span className={styles.label}>How often?</span>
          <div className={styles.toggle}>
            {[
              ['one-time', 'One time'],
              ['monthly', 'Every month'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={frequency === value}
                onClick={() => setFrequency(value)}
                className={frequency === value ? styles.toggleOn : ''}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {seva.items.length > 0 && (
        <div className={styles.field}>
          <span className={styles.label}>Sponsor an offering</span>
          <div className={styles.amounts}>
            {seva.items.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={selectedItem === item.label}
                onClick={() => {
                  setAmount(item.price)
                  setSelectedItem(item.label)
                }}
                className={`${styles.amount} ${selectedItem === item.label ? styles.amountOn : ''}`}
              >
                {item.label} · {inr(item.price)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <span className={styles.label}>Amount{frequency === 'monthly' ? ' per month' : ''}</span>
        <div className={styles.amounts}>
          {amounts.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={amount === a && !selectedItem}
              onClick={() => {
                setAmount(a)
                setSelectedItem(null)
              }}
              className={`${styles.amount} ${amount === a && !selectedItem ? styles.amountOn : ''}`}
            >
              {inr(a)}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="donate-amount">
          Other amount
        </label>
        <input
          id="donate-amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          required
          value={amount || ''}
          onChange={(e) => {
            setAmount(Number(e.target.value))
            setSelectedItem(null)
          }}
          className={styles.input}
          placeholder="Other amount (₹)"
        />
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Full name</span>
          <input name="fullName" required autoComplete="name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Mobile</span>
          <input name="mobile" type="tel" required autoComplete="tel" className={styles.input} />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            Occasion <span className={styles.optional}>(optional)</span>
          </span>
          <input
            name="occasion"
            placeholder="e.g. Birthday, anniversary"
            className={styles.input}
          />
        </label>
      </div>

      <details>
        <summary className={styles.label} style={{ cursor: 'pointer' }}>
          Need an 80G tax receipt? Add PAN and address
        </summary>
        <div className={styles.form} style={{ marginTop: '1rem' }}>
          <label className={styles.field}>
            <span className={styles.label}>PAN</span>
            <input
              name="pan"
              autoComplete="off"
              className={styles.input}
              placeholder="ABCDE1234F"
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Address</span>
              <input name="address" autoComplete="street-address" className={styles.input} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>PIN code</span>
              <input
                name="pin"
                inputMode="numeric"
                autoComplete="postal-code"
                className={styles.input}
              />
            </label>
          </div>
        </div>
      </details>

      <label className={styles.check}>
        <input type="checkbox" name="consent" />
        Send me receipts and festival updates on WhatsApp and email.
      </label>
      <p className={styles.legalNote}>
        By offering this seva you agree to our <Link href="/terms">Terms</Link>,{' '}
        <Link href="/refund-policy">Refund Policy</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <SpamGuard />
      {state?.ok === false && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`btn-donate ${styles.submit}`}>
        {pending
          ? 'Saving…'
          : `Offer ${amount ? inr(amount) : 'seva'}${frequency === 'monthly' ? ' / month' : ''} →`}
      </button>
    </form>
  )
}
