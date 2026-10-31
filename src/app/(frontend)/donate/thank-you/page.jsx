import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { getDonationStatus } from '@/lib/donations'
import { formatDate, inr } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { RefreshWhilePending, RememberedReference } from './Refresh'
import styles from '../../pages.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Thank you', robots: { index: false } }

const COPY = {
  paid: ['Hare Krishna! Your seva is received', 'Thank you for your offering.'],
  created: ['Confirming your payment…', 'This takes a few seconds. The page updates by itself.'],
  failed: ['Payment did not go through', 'No money was taken, or it will be refunded by your bank.'],
  expired: ['Payment time ran out', 'Please start the seva again to pay.'],
  refunded: ['This seva was refunded', 'Please contact the temple for details.'],
}

/** Where the KCM payment gateway sends donors after Razorpay (return_url). */
export default async function ThankYouPage({ searchParams }) {
  const { ref } = await searchParams
  const donation = /^SEVA-[A-F0-9]{10}$/.test(ref ?? '')
    ? await getDonationStatus(await getPayloadClient(), ref)
    : null

  if (!donation) {
    return (
      <>
        <PageHero eyebrow="Donate" title="Thank you" crumbs={[{ label: 'Donate', href: '/donate' }]} />
        <section className={styles.section}>
          <div className="container-x">
            <RememberedReference current={ref ?? null} />
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>We could not find this seva</p>
              <p className={styles.emptyText}>
                If you were charged, please contact the temple with your mobile number.{' '}
                <Link href="/contact" className={styles.more}>
                  Contact us →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </>
    )
  }

  const [title, text] = COPY[donation.status] ?? COPY.created
  return (
    <>
      <PageHero
        eyebrow={donation.seva ?? 'Donate'}
        title={title}
        intro={text}
        crumbs={[{ label: 'Donate', href: '/donate' }, { label: 'Thank you' }]}
      />
      <section className={styles.section}>
        <div className="container-x">
          {donation.status === 'created' && <RefreshWhilePending />}
          <ul className={styles.rows} style={{ maxWidth: '36rem' }}>
            <li>
              <span>Seva</span>
              <span className={styles.rowTime}>{donation.seva}</span>
            </li>
            <li>
              <span>Amount</span>
              <span className={styles.rowTime}>{inr(donation.amount)}</span>
            </li>
            <li>
              <span>Reference</span>
              <span className={styles.rowTime}>{donation.reference}</span>
            </li>
            {donation.receiptNo && (
              <li>
                <span>Receipt no.</span>
                <span className={styles.rowTime}>{donation.receiptNo}</span>
              </li>
            )}
            {donation.paidAt && (
              <li>
                <span>Paid on</span>
                <span className={styles.rowTime}>{formatDate(donation.paidAt)}</span>
              </li>
            )}
          </ul>
          <p style={{ marginTop: '1.5rem' }}>
            {donation.status === 'paid' ? (
              <>Your 80G receipt is sent to you on WhatsApp and email.</>
            ) : (
              <Link href="/donate" className="btn-donate">
                Offer seva again
              </Link>
            )}
          </p>
        </div>
      </section>
    </>
  )
}
