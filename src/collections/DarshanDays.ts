import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const DarshanDays: CollectionConfig = {
  slug: 'darshan-days',
  labels: { singular: 'Daily darshan', plural: 'Daily darshan' },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'photos'],
    description: "Upload the day's deity photos. They appear on /daily-darshan and the home page.",
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: '-date',
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      unique: true,
      index: true,
      defaultValue: () => new Date(),
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true, required: true },
  ],
}
