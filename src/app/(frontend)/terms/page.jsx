import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const revalidate = 3600
export const metadata = {
  title: 'Terms & Conditions',
  description: 'The terms for using the ISKCON Coimbatore website and making donations through it.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="By using this website or making a donation through it, you agree to the terms below."
      updated="2 November 2026"
    >
      <h2>About this website</h2>
      <p>
        This website is operated by the International Society for Krishna Consciousness (ISKCON),
        Sri Jagannath Mandir, Hare Krishna Road, Civil Aerodrome (PO), Coimbatore, Tamil Nadu 641014
        (&quot;we&quot; or &quot;us&quot;).
      </p>

      <h2>Using the website</h2>
      <ul>
        <li>
          The content is for general information and may change without notice. Temple timings,
          festival dates and schedules can change, so please check with the temple before travelling.
        </li>
        <li>
          We try to keep everything accurate but do not guarantee that all information is complete or
          free of errors.
        </li>
        <li>
          Text, photographs, artwork and design on this website belong to us or are used with
          permission, and may not be reproduced without our consent. The ISKCON name and lotus logo
          are registered trademarks of the International Society for Krishna Consciousness.
        </li>
        <li>
          Please do not misuse the website, for example by submitting false information or trying to
          disrupt it.
        </li>
        <li>
          Links to other websites, such as YouTube or WhatsApp, are provided for convenience. We are
          not responsible for their content or practices.
        </li>
      </ul>

      <h2>Donations and payments</h2>
      <ul>
        <li>Donations are voluntary and are made in Indian Rupees.</li>
        <li>
          Online payments are processed securely through ISKCON Coimbatore&apos;s KCM payment gateway
          and Razorpay. A donation is complete only once the payment is confirmed and a receipt is
          issued.
        </li>
        <li>
          Please give correct details. The name, PAN and address you provide are used on your receipt.
        </li>
        <li>
          Choosing a monthly Nitya Seva pays the first month now. Your card or account is not charged
          automatically after that; the temple will contact you about later months.
        </li>
        <li>
          The temple management may accept or decline any donation at its discretion. We are not
          liable for a transaction declined by your bank or payment provider.
        </li>
      </ul>
      <p>
        Refunds are covered by our <Link href="/refund-policy">Refund Policy</Link>, and your personal
        information by our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms and any dispute arising from the use of this website are subject to the laws of
        India.
      </p>
    </LegalPage>
  )
}
