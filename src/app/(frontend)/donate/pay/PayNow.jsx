'use client'

import Script from 'next/script'
import { useState } from 'react'
import { openCheckout } from '@/components/forms/DonateForm'
import { inr } from '@/lib/format'

/** Opens Razorpay as soon as its script loads, with a button to reopen it if closed. */
export function PayNow({ reference, amount, checkout }) {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const pay = () => {
    setDismissed(false)
    try {
      localStorage.setItem('lastSevaRef', reference)
    } catch {}
    openCheckout(checkout, () => setDismissed(true))
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => {
          setReady(true)
          pay()
        }}
      />
      <p style={{ marginBottom: '1.5rem' }}>
        {dismissed ? 'Payment not completed.' : ready ? 'Opening secure payment…' : 'Loading payment…'}
      </p>
      <button type="button" className="btn-donate" disabled={!ready} onClick={pay}>
        Pay {inr(amount)} now
      </button>
    </>
  )
}
