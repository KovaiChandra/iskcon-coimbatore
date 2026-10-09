export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] }

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Devotional Services', href: '/services' },
      { label: 'Courses', href: '/courses' },
    ],
  },
  { label: 'Daily Darshan', href: '/daily-darshan' },
  {
    label: 'Events',
    href: '/festivals',
    children: [
      { label: 'Festivals', href: '/festivals' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    label: 'Support Us',
    href: '/donate',
    children: [
      { label: 'Donate', href: '/donate' },
      { label: 'Volunteer', href: '/volunteer' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]
