'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { inr } from '@/lib/format'
import styles from './DonationCard.module.css'

type Props = {
  slug: string
  title: string
  description: string
  amounts: number[]
  image: ReactNode
  badge?: string
  featured?: boolean
  wide?: boolean
}

export function DonationCard({ slug, title, description, amounts, image, badge, featured, wide }: Props) {
  const [amount, setAmount] = useState(amounts[0])
  const href = `/donate/${slug}${amount ? `?amount=${amount}` : ''}`

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : wide ? styles.wide : ''}`}
    >
      <div className={styles.image}>{image}</div>
      <div className={styles.shade} />
      {badge && (
        <span className={styles.badge}>
          {badge}
        </span>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{description}</p>
        <div className={styles.amounts}>
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
          <Link href={href} className={`btn-donate ${styles.offer}`}>
            {amount ? `Offer ${inr(amount)}` : 'Offer seva'} →
          </Link>
        </div>
      </div>
    </article>
  )
}
