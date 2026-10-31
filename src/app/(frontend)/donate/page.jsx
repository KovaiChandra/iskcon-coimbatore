import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { Sparkle } from '@/components/art/Mandala'
import { DonationCard } from '@/components/home/DonationCard'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { getPayloadClient } from '@/lib/payload'
import { bannerFor, getSitePhotos } from '@/lib/site-photos'
import { isSevaActive } from '@/lib/sevas'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Donate',
  description:
    'Offer seva at ISKCON Coimbatore: Annadaan, Gau Seva, Vidya Daan, Kovai Chandra new temple and more. 80G eligible.',
}

export default async function DonatePage() {
  const payload = await getPayloadClient()
  const photos = await getSitePhotos(payload)
  const [sevas, settings] = await Promise.all([
    payload.find({ collection: 'sevas', sort: 'order', limit: 50, depth: 1 }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])
  const active = sevas.docs.filter((s) => isSevaActive(s))
  const monthly = active.filter((s) => s.allowMonthly)

  return (
    <>
      <PageHero
        image={bannerFor(photos, 'donate')}
        eyebrow="Support us"
        title="Offer your seva"
        intro="Every offering, large or small, serves the Lord and His devotees. Choose a seva below; donations are eligible for 80G tax exemption."
        crumbs={[{ label: 'Donate' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          <div className={styles.grid3}>
            {active.map((s) => (
              <DonationCard
                key={s.id}
                badge={s.category === 'festival' ? 'Festival' : undefined}
                slug={s.slug}
                title={s.title}
                description={s.shortDescription}
                amounts={(s.presetAmounts ?? []).map((p) => p.amount)}
                image={
                  <ImageOrPlaceholder
                    media={s.cardImage || s.image}
                    art={s.artwork ?? 'lotus'}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                }
              />
            ))}
          </div>
        </div>
      </section>

      {monthly.length > 0 && (
        <section className={styles.sectionDark}>
          <div className={`container-x ${styles.split}`}>
            <div>
              <p className={styles.eyebrow}>
                <Sparkle size={10} /> Nitya Seva · monthly
              </p>
              <h2 className={styles.h2}>Offer a little, every month</h2>
              <p className={styles.lead}>
                Set it once, serve all year. Cancel anytime on WhatsApp or email.
              </p>
            </div>
            <NityaSevaForm sevas={monthly.map((s) => ({ slug: s.slug, title: s.title }))} />
          </div>
        </section>
      )}

      <section className={styles.sectionAlt}>
        <div className={`container-x ${styles.grid3}`}>
          <div className={styles.feature}>
            <p className={styles.featureTitle} style={{ marginTop: 0 }}>
              80G tax exemption
            </p>
            <p className={styles.featureText}>
              {settings.reg80G
                ? `Registration ${settings.reg80G}${settings.reg80GValidity ? `, valid ${settings.reg80GValidity}` : ''}. `
                : ''}
              Add your PAN when you offer seva to receive an 80G receipt.
            </p>
          </div>
          <div className={styles.feature}>
            <p className={styles.featureTitle} style={{ marginTop: 0 }}>
              Pay by UPI or bank
            </p>
            <p className={styles.featureText}>
              {settings.upiId ? `UPI: ${settings.upiId}. ` : ''}After you choose a seva we show you
              the payment details and a reference number.
            </p>
          </div>
          <div className={styles.feature}>
            <p className={styles.featureTitle} style={{ marginTop: 0 }}>
              Questions about a donation?
            </p>
            <p className={styles.featureText}>
              Receipts, changes or anything else: we are happy to help.
            </p>
            <Link href="/contact?topic=Donation%20%2F%2080G%20receipt" className={styles.more}>
              Contact the seva office →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
