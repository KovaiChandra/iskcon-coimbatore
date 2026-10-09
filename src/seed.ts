/**
 * Fills an empty local database with sample content so every home page section renders.
 * Run with: npm run seed   (safe to re-run; skips anything that already exists)
 * Festival dates and amounts are placeholders for the temple to correct in /admin.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString()

async function upsert<T extends 'sevas' | 'festivals' | 'services' | 'courses'>(
  collection: T,
  key: 'slug' | 'title',
  data: Record<string, unknown>[],
) {
  const ids: number[] = []
  for (const doc of data) {
    const found = await payload.find({ collection, where: { [key]: { equals: doc[key] } }, limit: 1 })
    const id = found.docs[0]?.id ?? (await payload.create({ collection, data: doc as never })).id
    ids.push(id as number)
  }
  return ids
}

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    address: 'Sri Jagannath Mandir, Hare Krishna Road,\nCivil Aerodrome (PO), Coimbatore – 641014',
    phone: '+91 90422 16108',
    whatsapp: '919042216108',
    email: 'iskcon.coimbatore@gmail.com',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
  },
})

await payload.updateGlobal({
  slug: 'temple-timings',
  data: {
    openSessions: [
      { opens: '04:15', closes: '13:00' },
      { opens: '16:00', closes: '20:15' },
    ],
    schedule: [
      { time: '4:15 AM', activity: 'Mangala Arati', showInFooter: true },
      { time: '7:15 AM', activity: 'Darshan', showInFooter: true },
      { time: '8:00 AM', activity: 'Srimad Bhagavatam class' },
      { time: '12:30 PM', activity: 'Raj Bhoga Arati' },
      { time: '4:00–8:15 PM', activity: 'Evening Darshan', showInFooter: true },
      { time: '7:00 PM', activity: 'Sandhya Arati' },
    ],
  },
})

const sevaIds = await upsert('sevas', 'slug', [
  {
    title: 'Annadaan Seva',
    slug: 'annadaan',
    shortDescription: 'Feed devotees and visitors with sanctified Krishna prasadam.',
    presetAmounts: [{ amount: 1500 }, { amount: 3000 }],
    items: [{ label: 'Annadaan – 25 plates', price: 1000 }],
    allowMonthly: true,
    order: 1,
  },
  {
    title: 'Kartik Deepa Daan',
    slug: 'kartik-deepa-daan',
    category: 'festival',
    startDate: day(-3),
    endDate: day(30),
    shortDescription: 'Offer lamps to Lord Damodara in the holy month of Kartik.',
    presetAmounts: [{ amount: 501 }, { amount: 1001 }],
    order: 2,
  },
  {
    title: 'Vidya Daan – Gift of Gita',
    slug: 'vidya-daan',
    shortDescription: 'Sponsor Bhagavad-gita copies for schools, colleges and seekers.',
    presetAmounts: [{ amount: 1000 }, { amount: 2500 }],
    allowMonthly: true,
    order: 3,
  },
  {
    title: 'Birthday Annadaan',
    slug: 'birthday-seva',
    shortDescription: 'Make your birthday special by sponsoring prasadam in your name.',
    presetAmounts: [{ amount: 2500 }, { amount: 5000 }],
    order: 4,
  },
  {
    title: 'Gau Seva',
    slug: 'gau-seva',
    shortDescription: 'Care for the cows of our goshala.',
    presetAmounts: [{ amount: 1100 }, { amount: 2100 }],
    allowMonthly: true,
    order: 5,
  },
  {
    title: 'Kovai Chandra – New Temple',
    slug: 'new-temple',
    shortDescription: 'Contribute to building the new temple.',
    presetAmounts: [{ amount: 5000 }, { amount: 10000 }],
    order: 6,
  },
  {
    title: 'General Donation',
    slug: 'general-donation',
    shortDescription: 'Support the daily worship and activities of the temple.',
    presetAmounts: [{ amount: 501 }, { amount: 1001 }],
    allowMonthly: true,
    order: 7,
  },
])
const [annadaan, kartik, vidya, birthday] = sevaIds

await upsert('festivals', 'slug', [
  { name: 'Govardhan Puja', slug: 'govardhan-puja', date: day(20), timeLabel: '5:30 AM onwards', shortDescription: 'Celebrate the lifting of Govardhan Hill with an Annakut mountain of offerings.', seva: annadaan },
  { name: 'Rasa Purnima', slug: 'rasa-purnima', date: day(34), timeLabel: '6:00 PM onwards', shortDescription: 'The full-moon night of Kartik, celebrated with kirtan and abhishek.', seva: kartik },
  { name: 'Gita Jayanti', slug: 'gita-jayanti', date: day(60), timeLabel: '8:00 AM onwards', shortDescription: 'The appearance of Bhagavad-gita, celebrated with a full recitation and book distribution.', seva: vidya },
])

await upsert('services', 'title', [
  { title: 'Annadaan Distribution Seva', description: 'Join or sponsor the daily distribution of prasadam.', action: 'donate', seva: annadaan, featured: true, order: 1 },
  { title: 'Speak to a Priest', description: 'Guidance for samskaras, home pujas and spiritual questions.', action: 'whatsapp', featured: true, order: 2 },
  { title: 'Receive Krishna Prasadam', description: 'Sanctified food offered to the Lord, available every day.', action: 'enquiry', featured: true, order: 3 },
])

await upsert('courses', 'title', [
  { title: 'Learn to Chant', description: 'A gentle introduction to japa meditation on the Hare Krishna maha-mantra.', schedule: 'Every Saturday, 6:00 PM', mode: 'online', featured: true, order: 1 },
  { title: 'Srimad Bhagavatam Class', description: 'Daily morning class on the Bhagavata Purana.', schedule: 'Daily, 8:00 AM', mode: 'both', featured: true, order: 2 },
  { title: 'Bhagavad Gita Class', description: 'A chapter-by-chapter study for beginners.', schedule: 'Every Sunday, 5:00 PM', mode: 'temple', featured: true, order: 3 },
])

await payload.updateGlobal({
  slug: 'home-page',
  data: {
    highlightSevas: [annadaan, birthday, vidya],
    donationSevas: [annadaan, kartik, vidya, birthday],
    livePuja: { schedule: 'Daily 4:15 AM Mangala Arati · 7:00 PM Sandhya Arati', link: 'https://www.youtube.com/' },
  },
})

payload.logger.info('Seed complete')
process.exit(0)
