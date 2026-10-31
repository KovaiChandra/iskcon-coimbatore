import { PageHero } from '@/components/PageHero'
import { ArtGallery } from '@/components/home/ArtGallery'
import { getArtworks } from '@/lib/art-gallery'
import { getPayloadClient } from '@/lib/payload'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Art Gallery',
  description:
    'Sacred art of Sri Jagannath Mandir, ISKCON Coimbatore: paintings of Lord Krishna and darshan of the deities.',
}

export default async function ArtGalleryPage() {
  const payload = await getPayloadClient()
  const works = await getArtworks(payload)

  return (
    <>
      <PageHero
        eyebrow="Art gallery"
        title="Sacred art of Sri Jagannath Mandir"
        intro="Paintings of the Lord's pastimes and darshan of the deities, offered for your contemplation. Tap any artwork to view it full screen."
        crumbs={[{ label: 'Art Gallery' }]}
      />
      {works.length > 0 ? (
        <ArtGallery works={works} heading={false} />
      ) : (
        <section className={styles.section}>
          <div className="container-x">
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>The gallery is being prepared</p>
              <p className={styles.emptyText}>Please check back soon.</p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
