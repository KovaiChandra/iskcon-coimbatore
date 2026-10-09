'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { inr } from '@/lib/format'

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
      className={`group relative isolate flex overflow-hidden rounded-3xl bg-purple-950 text-white shadow-lg ring-1 ring-saffron-500/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/30 ${
        featured ? 'min-h-[520px] lg:row-span-2' : wide ? 'min-h-[300px] lg:col-span-2' : 'min-h-[300px]'
      }`}
    >
      <div className="absolute inset-0 -z-10 transition duration-700 group-hover:scale-105">{image}</div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-950 via-purple-950/50 to-transparent" />
      {badge && (
        <span className="absolute left-5 top-5 rounded-full bg-saffron-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-950">
          {badge}
        </span>
      )}
      <div className="mt-auto w-full p-6">
        <h3 className={`text-white ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{title}</h3>
        <p className={`mt-2 text-sm text-purple-100 ${featured ? 'max-w-sm' : 'line-clamp-2'}`}>{description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {amounts.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={a === amount}
              onClick={() => setAmount(a)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                a === amount ? 'bg-white text-purple-900' : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20'
              }`}
            >
              {inr(a)}
            </button>
          ))}
          <Link href={href} className="btn-donate ml-auto">
            {amount ? `Offer ${inr(amount)}` : 'Offer seva'} →
          </Link>
        </div>
      </div>
    </article>
  )
}
