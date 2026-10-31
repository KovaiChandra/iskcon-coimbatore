import { PageHero } from '@/components/PageHero'
import { Sparkle } from '@/components/art/Mandala'
import { VolunteerForm } from '@/components/forms/VolunteerForm'
import styles from '../pages.module.css'

export const metadata = {
  title: 'Volunteer',
  description:
    'Volunteer at ISKCON Coimbatore: festivals, prasadam, Annadaan, goshala, media and more.',
}

const REASONS = [
  [
    'Serve with joy',
    'Seva is the heart of bhakti. A few hours of service bring deep satisfaction.',
  ],
  [
    'Learn new skills',
    'Cooking, decoration, event management, media; learn alongside experienced devotees.',
  ],
  ['Find good company', 'Make friends with families, students and devotees who share your values.'],
]

export default function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Support us"
        title="Volunteer at Sri Jagannath Mandir"
        intro="Give your time and talents to the Lord. Festivals, prasadam, Annadaan, the goshala and more; there is a seva for everyone."
        crumbs={[{ label: 'Volunteer' }]}
      />

      <section className={styles.section}>
        <div className={`container-x ${styles.splitTop}`}>
          <div className={styles.aside}>
            <p className={styles.asideTitle} style={{ marginBottom: '1.5rem' }}>
              Tell us about yourself
            </p>
            <VolunteerForm />
          </div>
          <div className={styles.sticky}>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> Why volunteer
            </p>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
              {REASONS.map(([title, text]) => (
                <div key={title} className={styles.feature}>
                  <p className={styles.featureTitle} style={{ marginTop: 0 }}>
                    {title}
                  </p>
                  <p className={styles.featureText}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
