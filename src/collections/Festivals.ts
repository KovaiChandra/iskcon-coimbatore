import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { ART_OPTIONS } from '../lib/art'

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
    {
      name: 'artwork',
      type: 'select',
      defaultValue: 'lotus',
      options: ART_OPTIONS,
      admin: { description: 'Illustration shown until a photo is uploaded' },
    },
    { name: 'showInHero', type: 'checkbox', defaultValue: true, label: 'Show in home page slideshow while upcoming', admin: { position: 'sidebar' } },
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
