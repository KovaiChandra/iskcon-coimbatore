'use client'

import Link from 'next/link'
import { useState } from 'react'
import { inr } from '@/lib/format'
import styles from './SevaOfferCard.module.css'

/** White seva card: photo, short text, quick amounts and an Offer button. */
export function SevaOfferCard({ slug, title, description, amounts = [], image, tag, badge }) {
  const [amount, setAmount] = useState(amounts[0])
  const href = `/donate/${slug}${amount ? `?amount=${amount}` : ''}`

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <div className={styles.media}>{image}</div>
        {badge && <span className={styles.badge}>{badge}</span>}
        {tag && <span className={styles.tag}>{tag}</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{description}</p>
        {amounts.length > 0 && (
          <div className={styles.amounts} role="group" aria-label={`${title} amount`}>
            {amounts.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={a === amount}
                onClick={() => setAmount(a)}
                className={`${styles.amount} ${a === amount ? styles.amountOn : ''}`}
              >
                {inr(a)}
              </button>
            ))}
          </div>
        )}
        <Link href={href} className={`btn-donate ${styles.offer}`}>
          {amount ? `Offer ${inr(amount)}` : 'Offer seva'}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
