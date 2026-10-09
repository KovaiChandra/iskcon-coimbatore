import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { ART_OPTIONS } from '../lib/art'

export const Sevas: CollectionConfig = {
  slug: 'sevas',
  labels: { singular: 'Seva', plural: 'Sevas' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'startDate', 'endDate', 'order'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'regular',
      options: [
        { label: 'Regular seva', value: 'regular' },
        { label: 'Festival seva (shown only between dates)', value: 'festival' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.category === 'festival' },
      fields: [
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
      ],
    },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'artwork', type: 'select', defaultValue: 'lotus', options: ART_OPTIONS, admin: { description: 'Illustration shown until a photo is uploaded' } },
    {
      name: 'presetAmounts',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Quick amounts shown on donation cards, e.g. 1500 and 3000' },
      fields: [{ name: 'amount', type: 'number', required: true, min: 1 }],
    },
    {
      name: 'items',
      type: 'array',
      admin: { description: 'Optional quantity items, e.g. "Annadaan – 25 plates" at ₹1,000' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 1 },
      ],
    },
    { name: 'allowMonthly', type: 'checkbox', label: 'Offer as monthly Nitya Seva', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
