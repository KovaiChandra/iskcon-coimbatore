import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

// Records created by the public site (via server code), read and exported by staff.
const staffOnly = { read: authenticated, create: authenticated, update: authenticated, delete: authenticated }

export const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'seva', 'amount', 'status', 'createdAt'],
    group: 'Records',
  },
  access: staffOnly,
  fields: [
    { name: 'fullName', type: 'text', required: true },
    { name: 'mobile', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'pan', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'pin', type: 'text' },
    { name: 'seva', type: 'relationship', relationTo: 'sevas', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'occasion', type: 'text' },
    { name: 'frequency', type: 'select', defaultValue: 'one-time', options: ['one-time', 'monthly'] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'created',
      options: ['created', 'paid', 'failed', 'refunded'],
      admin: { position: 'sidebar' },
    },
    { name: 'razorpayOrderId', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'razorpayPaymentId', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'receiptNo', type: 'text', unique: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'consent', type: 'checkbox' },
  ],
}

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'phone', 'createdAt'], group: 'Records' },
  access: staffOnly,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'phone', type: 'text' },
    { name: 'consent', type: 'checkbox', label: 'Agreed to WhatsApp/SMS updates' },
  ],
}

export const Volunteers: CollectionConfig = {
  slug: 'volunteers',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'mobile', 'interest', 'createdAt'], group: 'Records' },
  access: staffOnly,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'mobile', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'area', type: 'text' },
    { name: 'interest', type: 'text' },
    { name: 'availability', type: 'text' },
    { name: 'skills', type: 'textarea' },
  ],
}

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: { useAsTitle: 'firstName', defaultColumns: ['firstName', 'lastName', 'category', 'createdAt'], group: 'Records' },
  access: staffOnly,
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      options: ['General', 'Donation / 80G receipt', 'Seva', 'Volunteer', 'Suggestion', 'Other'],
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'consent', type: 'checkbox' },
  ],
}
