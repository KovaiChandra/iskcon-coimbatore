import { Sparkle } from '@/components/art/Mandala'
import styles from './ScheduleTicker.module.css'

export function ScheduleTicker({ items }: { items: { time: string; activity: string }[] }) {
  if (items.length === 0) return null
  const row = (hidden?: boolean) => (
    <ul className={styles.list} aria-hidden={hidden}>
      {items.map((t, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.time}>{t.time}</span>
          <span>{t.activity}</span>
          <Sparkle size={10} className={styles.star} />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={styles.ticker}>
      <div className={styles.row}>
        <span className={styles.label}>Today at the temple</span>
        <div className={styles.viewport}>
          <div className={`marquee ${styles.track}`}>
            {row()}
            {row(true)}
          </div>
        </div>
      </div>
    </div>
  )
}
