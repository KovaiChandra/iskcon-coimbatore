'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { inr } from '@/lib/format'

type Props = { slug: string; title: string; description: string; amounts: number[]; image: ReactNode }

export function DonationCard({ slug, title, description, amounts, image }: Props) {
  const [amount, setAmount] = useState(amounts[0])
  const href = `/donate/${slug}${amount ? `?amount=${amount}` : ''}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
      <div className="relative aspect-[4/3]">{image}</div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{description}</p>
        {amounts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={`${title} amount`}>
            {amounts.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={a === amount}
                onClick={() => setAmount(a)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  a === amount ? 'border-purple-700 bg-purple-700 text-white' : 'border-purple-200 text-purple-800 hover:border-purple-400'
                }`}
              >
                {inr(a)}
              </button>
            ))}
          </div>
        )}
        <Link href={href} className="btn-donate mt-5 w-full">
          {amount ? `Donate ${inr(amount)}` : 'Donate Now'}
        </Link>
      </div>
    </article>
  )
}
