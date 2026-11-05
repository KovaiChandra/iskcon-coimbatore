import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { DonateForm } from '@/components/forms/DonateForm'
import { mediaUrl } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { isSevaActive } from '@/lib/sevas'
import styles from '../../pages.module.css'

export const revalidate = 60

async function getSeva(slug) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'sevas',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0]
}

export async function generateMetadata({ params }) {
  const seva = await getSeva((await params).slug)
  return seva ? { title: seva.title, description: seva.shortDescription } : {}
}

export default async function SevaPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const seva = await getSeva(slug)
  // A seva that is missing or removed: show all the ways to give rather than a 404
  if (!seva) redirect('/donate')

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const open = isSevaActive(seva)

  return (
    <>
      <PageHero
        eyebrow={seva.category === 'festival' ? 'Festival seva' : 'Offer seva'}
        title={seva.title}
        intro={seva.shortDescription}
        image={seva.image || seva.cardImage}
        crumbs={[{ label: 'Donate', href: '/donate' }, { label: seva.title }]}
      />

      <section className={styles.section}>
        <div className={`container-x ${styles.splitTop}`}>
          <div className={styles.aside}>
            {open ? (
              <>
                <p className={styles.asideTitle} style={{ marginBottom: '1.5rem' }}>
                  Your offering
                </p>
                <DonateForm
                  seva={{
                    slug: seva.slug,
                    title: seva.title,
                    allowMonthly: !!seva.allowMonthly,
                    amounts: (seva.presetAmounts ?? []).map((p) => p.amount),
                    items: (seva.items ?? []).map(({ label, price }) => ({ label, price })),
                  }}
                  initialAmount={Number(query.amount) || undefined}
                  initialFrequency={query.frequency}
                  pay={{
                    upiId: settings.upiId || null,
                    upiQr: mediaUrl(settings.upiQr),
                    bankDetails: settings.bankDetails || null,
                    whatsapp: settings.whatsapp || null,
                  }}
                />
              </>
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>This festival seva is closed for now</p>
                <p className={styles.emptyText}>
                  <Link href="/donate" className={styles.more}>
                    See all sevas →
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div className={styles.sticky}>
            <div className={styles.photo}>
              <ImageOrPlaceholder
                media={seva.cardImage || seva.image}
                art={seva.artwork ?? 'lotus'}
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
            </div>
            <ul className={styles.rows} style={{ marginTop: '1.5rem' }}>
              <li>
                <span>80G tax exemption</span>
                <span className={styles.rowTime}>Eligible</span>
              </li>
              <li>
                <span>Receipt</span>
                <span className={styles.rowTime}>By email &amp; WhatsApp</span>
              </li>
              {settings.reg80G && (
                <li>
                  <span>80G registration</span>
                  <span className={styles.rowTime}>{settings.reg80G}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
