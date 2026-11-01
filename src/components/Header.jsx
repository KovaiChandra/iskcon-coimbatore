'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAV } from '@/lib/nav'
import Image from 'next/image'
import { ChevronDown, SearchIcon } from './Icons'
import styles from './Header.module.css'

export function Header({ socials }) {
  const pathname = usePathname()
  // Remember which page the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const menuOpen = openOn === pathname

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className={`${styles.header} ${menuOpen ? styles.menuOpen : ''}`}>
      <div className={`container-x ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="ISKCON Coimbatore home">
          {/* ISKCON lotus in white (public/brand/iskcon-lotus-white.svg) beside the temple's name */}
          <Image
            src="/brand/iskcon-lotus-white.svg"
            alt=""
            width={516}
            height={480}
            priority
            unoptimized
            className={styles.lotus}
          />
          <span className={styles.wordmark}>
            <span className={styles.wordName}>ISKCON Coimbatore</span>
            <span className={styles.wordRule} aria-hidden />
            <span className={styles.wordSub}>Sri Jagannath Mandir</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {NAV.map((item) => (
              <li key={item.label} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                >
                  {item.label}
                  {item.children && <ChevronDown />}
                </Link>
                {item.children && (
                  <ul className={styles.dropdown}>
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className={styles.dropdownLink}>
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

        <div className={styles.actions}>
          <Link href="/search" aria-label="Search" className={styles.search}>
            <SearchIcon />
          </Link>
          <Link href="/donate" className={`btn-donate ${styles.donate}`}>
            DONATE
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
          >
            <svg
              viewBox="0 0 24 24"
              className={styles.menuIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav
            className={`container-x ${styles.mobileNav}`}
            aria-label="Mobile"
            onClick={(e) => e.target.closest('a') && setOpenOn(null)}
          >
            <ul className={styles.mobileList}>
              {NAV.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className={styles.mobileToggle}
                        aria-expanded={expanded === item.label}
                        onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={`${styles.chevron} ${expanded === item.label ? styles.chevronOpen : ''}`}
                        />
                      </button>
                      {expanded === item.label && (
                        <ul className={styles.mobileSub}>
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className={styles.mobileSubLink}>
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} className={styles.mobileLink}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href="/search" className={styles.mobileLink}>
                  Search
                </Link>
              </li>
            </ul>
          </nav>
          <div className={styles.mobileSocials}>
            <div className="container-x">{socials}</div>
          </div>
        </div>
      )}
    </header>
  )
}
