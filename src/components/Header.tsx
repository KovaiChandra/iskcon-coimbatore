'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { NAV } from '@/lib/nav'
import { ChevronDown, LotusMark, SearchIcon } from './Icons'

export function Header({ socials }: { socials: ReactNode }) {
  const pathname = usePathname()
  // Remember which page the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const menuOpen = openOn === pathname

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-white">
      <div className="container-x flex h-16 items-center gap-2 xl:h-20">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <LotusMark className="size-9 shrink-0 sm:size-10 xl:size-12" />
          <span className="whitespace-nowrap leading-tight">
            <span className="block font-serif text-base text-purple-800 sm:text-lg xl:text-xl">ISKCON Coimbatore</span>
            <span className="block text-[11px] text-muted sm:text-xs">Sri Jagannath Mandir</span>
          </span>
        </Link>

        <nav className="mx-auto hidden xl:block" aria-label="Main">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium hover:text-purple-700 ${
                    isActive(item.href) ? 'text-purple-700' : 'text-ink'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown />}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-0 top-full min-w-48 rounded-xl border border-purple-100 bg-white p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 xl:ml-0">
          <Link href="/search" aria-label="Search" className="hidden rounded-full p-2 text-purple-700 hover:bg-purple-50 xl:block">
            <SearchIcon />
          </Link>
          <Link href="/donate" className="btn-donate px-4 sm:px-5">
            DONATE
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-purple-800 hover:bg-purple-50 xl:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-white xl:hidden">
          <nav className="container-x flex-1 py-4" aria-label="Mobile">
            <ul className="divide-y divide-purple-100">
              {NAV.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3.5 text-left font-medium"
                        aria-expanded={expanded === item.label}
                        onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                      >
                        {item.label}
                        <ChevronDown className={`size-4 transition ${expanded === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {expanded === item.label && (
                        <ul className="pb-3 pl-4">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className="block py-2 text-muted">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} className="block py-3.5 font-medium">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href="/search" className="block py-3.5 font-medium">
                  Search
                </Link>
              </li>
            </ul>
          </nav>
          <div className="bg-purple-800 py-5 text-white">
            <div className="container-x">{socials}</div>
          </div>
        </div>
      )}
    </header>
  )
}
