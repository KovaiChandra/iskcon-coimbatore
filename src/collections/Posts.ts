import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt', '_status'] },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Festivals', 'Philosophy', 'Temple News', 'Tamil'].map((c) => ({ label: c, value: c })),
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', required: true, defaultValue: () => new Date(), admin: { position: 'sidebar' } },
    { name: 'author', type: 'text', admin: { position: 'sidebar' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'content', type: 'richText', required: true },
  ],
}
