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
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'arch',
          options: [
            { label: 'Arch: text left, photo in a temple arch', value: 'arch' },
            {
              label: 'Full photo: the photo fills the banner, text bottom-left',
              value: 'cinematic',
            },
          ],
          admin: { description: 'Use Full photo for landscape photos, Arch for portrait photos' },
        },
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'purple',
          label: 'Colour',
          options: [
            { label: 'Royal purple', value: 'purple' },
            { label: 'Sunset maroon', value: 'maroon' },
            { label: 'Dusk indigo', value: 'indigo' },
            { label: 'Forest green', value: 'green' },
            { label: 'Saffron gold', value: 'saffron' },
          ],
          admin: { description: 'Colour the photo fades into behind the text (Full photo layout)' },
        },
        {
          name: 'eyebrow',
          type: 'text',
          admin: { description: 'Small line above the heading, e.g. "Every Sunday"' },
        },
        { name: 'heading', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
        {
          name: 'verse',
          type: 'text',
          admin: {
            description:
              'Optional short scripture line shown under the text, e.g. from Damodarastakam',
          },
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'artwork',
          type: 'select',
          defaultValue: 'temple',
          options: ART_OPTIONS,
          admin: {
            description:
              'Used when there is no image. "Lamps" also gives the slide a warm Kartik lamplight look.',
          },
        },
        {
          type: 'row',
          fields: [
            { name: 'buttonLabel', type: 'text' },
            {
              name: 'link',
              type: 'text',
              admin: { description: 'e.g. /festivals/kartik or /donate/annadaan' },
            },
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
      admin: {
        description:
          'Donation cards row. Festival sevas outside their dates are hidden automatically.',
      },
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
        {
          name: 'schedule',
          type: 'text',
          admin: { description: 'e.g. "Daily 4:15 AM Mangala Arati · 7:15 PM Sandhya Arati"' },
        },
        { name: 'link', type: 'text', label: 'Zoom / YouTube live link' },
      ],
    },
  ],
}
