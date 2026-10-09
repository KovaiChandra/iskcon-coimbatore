import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Session } from '@/lib/temple-status'
import { TempleStatus } from './TempleStatus'

export function TopBar({ sessions, socials }: { sessions: Session[]; socials: ReactNode }) {
  return (
    <div className="hidden bg-purple-900 text-xs text-purple-100 lg:block">
      <div className="container-x flex h-9 items-center gap-5">
        <Link href="/daily-darshan" className="font-medium text-saffron-300 hover:underline">
          Today&apos;s Darshan
        </Link>
        <TempleStatus sessions={sessions} />
        <div className="ml-auto flex items-center gap-5">
          <Link href="/donate/general-donation" className="hover:text-white">
            Quick Donate
          </Link>
          <Link href="/admin" className="hover:text-white">
            Login
          </Link>
          {socials}
        </div>
      </div>
    </div>
  )
}
