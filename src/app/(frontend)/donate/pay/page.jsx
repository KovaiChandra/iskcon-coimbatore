import { redirect } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { inr } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { PayNow } from './PayNow'
import styles from '../../pages.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pay for your seva', robots: { index: false } }

/**
 * Opens Razorpay for a donation that was started elsewhere (the mobile app opens this page in
 * a browser view). After paying, the gateway returns the donor to /donate/thank-you?ref=….
 */
export default async function PayPage({ searchParams }) {
  const { ref } = await searchParams
  if (!/^SEVA-[A-F0-9]{10}$/.test(ref ?? '')) redirect('/donate')

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'donations',
    where: { reference: { equals: ref } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const d = docs[0]
  if (!d || d.status !== 'created' || !d.gatewayCheckout) redirect(`/donate/thank-you?ref=${ref}`)

  return (
    <>
      <PageHero
        eyebrow={typeof d.seva === 'object' && d.seva ? d.seva.title : 'Donate'}
        title={`Pay ${inr(d.amount)}`}
        intro={`Reference ${ref}`}
        crumbs={[{ label: 'Donate', href: '/donate' }, { label: 'Pay' }]}
      />
      <section className={styles.section}>
        <div className="container-x">
          <PayNow reference={ref} amount={d.amount} checkout={d.gatewayCheckout} />
        </div>
      </section>
    </>
  )
}
