import Link from 'next/link'
import { TempleStatus } from './TempleStatus'
import styles from './TopBar.module.css'

export function TopBar({ sessions }) {
  return (
    <div className={styles.bar}>
      <div className={`container-x ${styles.inner}`}>
        <Link href="/daily-darshan" className={styles.darshan}>
          Today&apos;s Darshan
        </Link>
        <TempleStatus sessions={sessions} />
        <div className={styles.right}>
          <Link href="/donate/general-donation" className={styles.link}>
            Quick Donate
          </Link>
          <Link href="/admin" className={styles.link}>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
