import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const revalidate = 3600
export const metadata = {
  title: 'Refund Policy',
  description: 'When donations to ISKCON Coimbatore can be refunded, and how to ask for a refund.',
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="Donations are offerings to the Lord and are generally not refundable. If a payment was made by mistake, please tell us and we will help."
      updated="2 November 2026"
    >
      <h2>When a refund is possible</h2>
      <ul>
        <li>The same donation was charged more than once.</li>
        <li>A wrong amount was paid by mistake.</li>
        <li>Your account was charged but the payment failed and no receipt was issued.</li>
      </ul>
      <p>
        Refunds are made when the temple management is satisfied with the reason for the error. Other
        donations, once made, cannot be cancelled or refunded.
      </p>

      <h2>Fraudulent payments</h2>
      <p>
        Donations cannot be charged back except in cases of fraudulent use, after investigation by the
        relevant bank or government authorities.
      </p>

      <h2>How to ask for a refund</h2>
      <p>
        Please contact us as soon as possible using the details below, and include your donation
        reference (it starts with SEVA-), receipt number if you have one, the amount, the date, and
        the mobile number you used.
      </p>

      <h2>How refunds are paid</h2>
      <p>
        Approved refunds go back to the original payment method. Your bank or payment provider may
        take a few working days to show the amount in your account.
      </p>

      <h2>Receipts and 80G</h2>
      <p>
        If a donation is refunded, any receipt issued for it is cancelled, and it can no longer be
        used to claim an income tax benefit.
      </p>

      <h2>Monthly Nitya Seva</h2>
      <p>
        Monthly seva is not charged automatically. To stop it, simply tell us and we will not contact
        you for further months.
      </p>
      <p>
        See also our <Link href="/terms">Terms &amp; Conditions</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  )
}
