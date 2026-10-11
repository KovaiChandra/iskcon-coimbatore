import { waLink } from '@/lib/format'
import { WhatsAppIcon } from './Icons'
import styles from './WhatsAppFloat.module.css'

export function WhatsAppFloat({ number }) {
  return (
    <a
      href={waLink(number, 'Hare Krishna! I have a question.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={styles.button}
    >
      <WhatsAppIcon size={28} />
    </a>
  )
}
