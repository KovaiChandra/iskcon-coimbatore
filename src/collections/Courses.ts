import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'schedule', 'mode', 'featured'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'schedule', type: 'text', admin: { description: 'e.g. "Every Sunday, 6:00 PM"' } },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'online',
      options: [
        { label: 'Online (Zoom)', value: 'online' },
        { label: 'At the temple', value: 'temple' },
        { label: 'Online and at the temple', value: 'both' },
      ],
    },
    { name: 'zoomLink', type: 'text' },
    { name: 'featured', type: 'checkbox', label: 'Show on home page', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
