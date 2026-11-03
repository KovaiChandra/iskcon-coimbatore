import Link from 'next/link'

/** "Analytics" in the admin's side menu. Uses the admin's own menu-link styles. */
export function AnalyticsNavLink() {
  return (
    <Link href="/admin/analytics" className="nav__link" style={{ marginTop: '1rem' }}>
      <span className="nav__link-label">Analytics</span>
    </Link>
  )
}
