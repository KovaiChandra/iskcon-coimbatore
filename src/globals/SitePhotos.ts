import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

const photo = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  admin: description ? { description } : undefined,
})

/**
 * Photos and videos for the sections that have no other place to upload them.
 * Every field is optional: when it is empty, the site keeps the photo it shows today.
 */
export const SitePhotos: GlobalConfig = {
  slug: 'site-photos',
  label: 'Photos & Videos',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Explore the temple',
          description: 'The 6 photo tiles in "Discover Sri Jagannath Mandir" on the home page',
          fields: [
            {
              name: 'explore',
              type: 'group',
              label: false,
              fields: [
                photo('deities', 'The Deities'),
                photo('kirtan', 'Arati & Kirtan'),
                photo('prasadam', 'Prasadam'),
                photo('goshala', 'Goshala'),
                photo('kovaiChandra', 'Kovai Chandra'),
                photo('visit', 'Plan your visit'),
              ],
            },
          ],
        },
        {
          label: 'Art gallery',
          description:
            'Artworks on the home page (first 8) and the Art gallery page (all). Drag to reorder.',
          fields: [
            {
              name: 'artGallery',
              type: 'array',
              label: 'Artworks',
              labels: { singular: 'Artwork', plural: 'Artworks' },
              admin: {
                description:
                  'Home page mosaic order: large square, tall, square, square, wide, wide, tall, tall',
              },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    {
                      name: 'kind',
                      type: 'text',
                      admin: { description: 'e.g. Darshan, Painting, Festival, Temple' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Instagram reels',
          description: 'Up to 4 reels in the Instagram section at the bottom of the home page',
          fields: [
            {
              name: 'reels',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Reel', plural: 'Reels' },
              fields: [
                {
                  name: 'poster',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Photo',
                  admin: { description: 'Shown before the video plays, or alone if there is no video' },
                },
                {
                  name: 'video',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Optional MP4 of the reel. Plays silently on the page' },
                },
                { name: 'caption', type: 'text', required: true },
                {
                  name: 'link',
                  type: 'text',
                  admin: {
                    description:
                      'The reel on Instagram. If empty, opens the Instagram profile from Site settings',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Kovai Chandra',
          description: 'Photos of the new temple on the Kovai Chandra and About pages',
          fields: [
            {
              name: 'kovai',
              type: 'group',
              label: false,
              fields: [
                photo('banner', 'Banner photo', 'Top of the Kovai Chandra page and on the About page'),
                {
                  name: 'photos',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  label: 'Progress photos',
                  admin: { description: 'Construction photos shown on the Kovai Chandra page' },
                },
              ],
            },
          ],
        },
        {
          label: 'Page banners',
          description:
            'Photo on the right of the purple banner at the top of each page. Leave empty for no photo.',
          fields: [
            {
              name: 'banners',
              type: 'group',
              label: false,
              fields: [
                photo('services', 'Services'),
                photo('courses', 'Courses'),
                photo('festivals', 'Festivals'),
                photo('donate', 'Donate'),
                photo('volunteer', 'Volunteer'),
                photo('dailyDarshan', 'Daily darshan'),
                photo('artGallery', 'Art gallery'),
                photo('blog', 'Blog'),
                photo('contact', 'Contact'),
              ],
            },
          ],
        },
      ],
    },
  ],
}
