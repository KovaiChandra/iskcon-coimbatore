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
            {
              label:
                'Collage: text left, main photo with two smaller photos (top-left, bottom-right)',
              value: 'collage',
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
            { label: 'Ivory (light, dark text)', value: 'ivory' },
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Photo. For a video slide, this is shown while the video loads' },
        },
        {
          name: 'imageTopLeft',
          type: 'upload',
          relationTo: 'media',
          label: 'Top-left photo',
          admin: {
            condition: (_, s) => s?.layout === 'collage',
            description: 'Collage layout: small photo overlapping the top-left of the main photo',
          },
        },
        {
          name: 'imageBottomRight',
          type: 'upload',
          relationTo: 'media',
          label: 'Bottom-right photo',
          admin: {
            condition: (_, s) => s?.layout === 'collage',
            description:
              'Collage layout: small photo overlapping the bottom-right of the main photo',
          },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Optional background video (MP4 or MOV) for "Full photo" slides. Plays silently; the slide lasts as long as the video',
          },
        },
        {
          name: 'videoWebm',
          type: 'upload',
          relationTo: 'media',
          label: 'Video (WebM copy)',
          admin: {
            description:
              'Optional WebM version of the same video, for browsers that cannot play the MP4/MOV (e.g. Firefox)',
          },
        },
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Large photo in the About collage' },
        },
        {
          name: 'smallImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Small photo, top-left of the collage' },
        },
        {
          name: 'cardImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Framed card, bottom-left of the collage (uses the founder photo if empty)',
          },
        },
        { name: 'cardTitle', type: 'text', admin: { description: 'e.g. "Sri Jagannath"' } },
        {
          name: 'cardSubtitle',
          type: 'text',
          admin: { description: 'e.g. "Lord of the Universe"' },
        },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'visitImage',
      type: 'upload',
      relationTo: 'media',
      label: '"Plan your visit" photo',
      admin: { description: 'Photo beside the darshan timings card on the home page' },
    },
    {
      name: 'founder',
      type: 'group',
      label: 'Founder section',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Portrait of Srila Prabhupada' },
        },
      ],
    },
    {
      name: 'livePuja',
      type: 'group',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Deity photo beside the live puja text' },
        },
        { name: 'title', type: 'text', defaultValue: 'Live online puja' },
        { name: 'text', type: 'textarea' },
        { name: 'time', type: 'text', admin: { description: 'e.g. "Every day · 7:00 PM IST"' } },
        { name: 'platform', type: 'text', defaultValue: 'YouTube · Free to join' },
        {
          name: 'schedule',
          type: 'text',
          admin: { description: 'e.g. "Daily 4:15 AM Mangala Arati · 7:15 PM Sandhya Arati"' },
        },
        { name: 'link', type: 'text', label: 'Zoom / YouTube live link' },
      ],
    },
    {
      name: 'youtubeVideos',
      type: 'array',
      label: 'YouTube videos',
      maxRows: 6,
      admin: {
        description:
          'Videos shown in the "ISKCON Coimbatore on YouTube" section. Paste the YouTube link; the thumbnail is fetched automatically.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'date', type: 'date' },
      ],
    },
  ],
}
