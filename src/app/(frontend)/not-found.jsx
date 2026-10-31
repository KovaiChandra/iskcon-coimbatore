import Link from 'next/link'
import { PageHero } from '@/components/PageHero'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <PageHero
      eyebrow="Page not found"
      title="This page has wandered off"
      intro="The page you are looking for may have moved. Let us take you back to the temple."
    >
      <Link href="/" className="btn-donate btn-lg">
        Go to the home page
      </Link>
      <Link href="/search" className="btn-outline btn-lg">
        Search
      </Link>
    </PageHero>
  )
}
