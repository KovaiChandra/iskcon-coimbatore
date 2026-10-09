import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'heading', type: 'text' },
        { name: 'text', type: 'textarea' },
        { name: 'link', type: 'text', admin: { description: 'Optional, e.g. /festivals/kartik or /donate/annadaan' } },
      ],
    },
    {
      name: 'highlightSevas',
      type: 'relationship',
      relationTo: 'sevas',
      hasMany: true,
      maxRows: 3,
      admin: { description: '3 cards overlapping the bottom of the banner' },
    },
    {
      name: 'donationSevas',
      type: 'relationship',
      relationTo: 'sevas',
      hasMany: true,
      maxRows: 4,
      admin: { description: 'Donation cards row. Festival sevas outside their dates are hidden automatically.' },
    },
    {
      name: 'about',
      type: 'group',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'livePuja',
      type: 'group',
      fields: [
        { name: 'schedule', type: 'text', admin: { description: 'e.g. "Daily 4:15 AM Mangala Arati · 7:15 PM Sandhya Arati"' } },
        { name: 'link', type: 'text', label: 'Zoom / YouTube live link' },
      ],
    },
  ],
}
