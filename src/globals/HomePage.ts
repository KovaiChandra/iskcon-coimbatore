import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { ART_OPTIONS } from '../lib/art'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      admin: {
        description:
          'Extra slides shown first in the slideshow. Upcoming festivals and running festival sevas are added automatically after these.',
      },
      fields: [
        { name: 'eyebrow', type: 'text', admin: { description: 'Small line above the heading, e.g. "Every Sunday"' } },
        { name: 'heading', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'artwork', type: 'select', defaultValue: 'temple', options: ART_OPTIONS, admin: { description: 'Used when there is no image' } },
        {
          type: 'row',
          fields: [
            { name: 'buttonLabel', type: 'text' },
            { name: 'link', type: 'text', admin: { description: 'e.g. /festivals/kartik or /donate/annadaan' } },
          ],
        },
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
