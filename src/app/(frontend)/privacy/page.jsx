import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const revalidate = 3600
export const metadata = {
  title: 'Privacy Policy',
  description: 'How ISKCON Coimbatore collects, uses and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We respect your privacy. This page explains what we collect through this website, why, and the choices you have."
      updated="2 November 2026"
    >
      <h2>Information we collect</h2>
      <p>We only collect what you choose to give us through the forms on this website:</p>
      <ul>
        <li>
          <strong>Donations:</strong> name, mobile number, email, the seva and amount, and any
          occasion you mention. PAN, address and PIN code are optional and used for your 80G receipt.
        </li>
        <li>
          <strong>Course registration and Speak to a priest:</strong> name, phone, optional email,
          the best time to reach you, and your question or message.
        </li>
        <li>
          <strong>Contact, volunteer and subscription forms:</strong> the details you enter, such as
          name, phone, email and your areas of interest.
        </li>
      </ul>
      <p>
        We do not see or store your card, UPI or bank login details. Those are entered on the
        payment provider&apos;s secure page.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To process your donation and issue your receipt.</li>
        <li>To reply to you, register you for a course, or arrange a time with a priest.</li>
        <li>To keep the temple&apos;s donation and accounting records.</li>
        <li>
          To send you festival and temple updates on WhatsApp, SMS or email, only if you have ticked
          the box agreeing to this. You can opt out at any time.
        </li>
      </ul>
      <p>We do not sell or rent your personal information to anyone.</p>

      <h2>Who we share it with</h2>
      <p>We share information only as needed to run this website and serve you:</p>
      <ul>
        <li>
          <strong>Payments:</strong> ISKCON Coimbatore&apos;s KCM payment gateway and Razorpay, which
          process your payment and issue your receipt.
        </li>
        <li>
          <strong>Hosting:</strong> the service providers that host this website, its database and
          its files.
        </li>
        <li>
          <strong>Authorities:</strong> where the law requires it, for example for tax records.
        </li>
      </ul>

      <h2>Visitor statistics, cookies and embedded video</h2>
      <p>
        We count visits to understand which pages are useful. This uses no cookies and does not
        identify you: we record the page viewed, the type of device, the site or campaign that
        brought you here and your approximate city. Your IP address is never stored: visit counts use
        a scrambled code that changes every day, and our limits on repeated form submissions (to
        prevent spam) use a scrambled code that is cleared regularly.
      </p>
      <p>
        This website does not use advertising cookies. Your browser may remember your donation
        reference so that we can show your receipt after payment. When the live darshan stream is
        playing, the video is provided by YouTube, which has its own privacy policy.
      </p>

      <h2>Keeping your information safe</h2>
      <p>
        Information travels to this website over an encrypted connection, and only authorised temple
        staff can see the records in our admin system. We keep donation records for as long as
        accounting and tax rules require, and other messages only for as long as they are useful.
      </p>

      <h2>Your choices</h2>
      <p>
        You can contact us at any time to see the information we hold about you, correct it, ask us
        to delete it (except records we must keep by law), or stop receiving updates.
      </p>
      <p>
        See also our <Link href="/terms">Terms &amp; Conditions</Link> and{' '}
        <Link href="/refund-policy">Refund Policy</Link>.
      </p>
    </LegalPage>
  )
}
