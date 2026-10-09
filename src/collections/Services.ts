import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'action', 'featured', 'order'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'action',
      type: 'select',
      required: true,
      defaultValue: 'donate',
      options: [
        { label: 'Open donation form', value: 'donate' },
        { label: 'Open WhatsApp chat', value: 'whatsapp' },
        { label: 'Open enquiry form', value: 'enquiry' },
        { label: 'External link', value: 'link' },
      ],
    },
    { name: 'seva', type: 'relationship', relationTo: 'sevas', admin: { condition: (d) => d?.action === 'donate' } },
    { name: 'url', type: 'text', admin: { condition: (d) => d?.action === 'link' } },
    { name: 'buttonLabel', type: 'text' },
    { name: 'featured', type: 'checkbox', label: 'Show on home page', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
