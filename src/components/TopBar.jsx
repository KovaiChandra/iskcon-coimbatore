import Link from 'next/link'
import { TempleStatus } from './TempleStatus'
import styles from './TopBar.module.css'

export function TopBar({ sessions, socials }) {
  return (
    <div className={styles.bar}>
      <div className={`container-x ${styles.inner}`}>
        <Link href="/daily-darshan" className={styles.darshan}>
          Today&apos;s Darshan
        </Link>
        <TempleStatus sessions={sessions} />
        <div className={styles.right}>
          <Link href="/donate/general-donation" className={styles.pill}>
            Quick Donate
          </Link>
          <Link href="/admin" className={`${styles.pill} ${styles.pillSmall}`}>
            Login
          </Link>
          <div className={styles.socials}>{socials}</div>
        </div>
      </div>
    </div>
  )
}
