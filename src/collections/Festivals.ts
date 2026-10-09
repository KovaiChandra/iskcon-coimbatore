import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Festivals: CollectionConfig = {
  slug: 'festivals',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'date'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'date',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    { name: 'date', type: 'date', required: true, index: true },
    { name: 'timeLabel', type: 'text', admin: { description: 'e.g. "5:30 AM onwards"' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'significance', type: 'richText' },
    {
      name: 'schedule',
      type: 'array',
      fields: [
        { name: 'time', type: 'text', required: true },
        { name: 'activity', type: 'text', required: true },
      ],
    },
    { name: 'seva', type: 'relationship', relationTo: 'sevas', admin: { description: 'Donation form opened by "Support"' } },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
  ],
}
