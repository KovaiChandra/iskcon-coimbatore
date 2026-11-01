import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'
import { PRIEST_MODES, PRIEST_TOPICS } from '../lib/enquiry-options'

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
      options: ['created', 'paid', 'failed', 'expired', 'refunded'],
      admin: { position: 'sidebar' },
    },
    { name: 'reference', type: 'text', unique: true, index: true, admin: { position: 'sidebar', readOnly: true, description: 'Shown to the donor, e.g. SEVA-3F9A1C07B2' } },
    { name: 'gatewaySessionId', type: 'text', index: true, label: 'Gateway session', admin: { position: 'sidebar', readOnly: true } },
    { name: 'gatewayCheckout', type: 'json', admin: { hidden: true } },
    { name: 'kcmContactId', type: 'text', label: 'KCM contact', admin: { position: 'sidebar', readOnly: true } },
    { name: 'razorpayOrderId', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'razorpayPaymentId', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'receiptNo', type: 'text', unique: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'paidAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    { name: 'failureReason', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'source', type: 'select', defaultValue: 'website', options: ['website', 'app'], admin: { position: 'sidebar', readOnly: true } },
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

/** "Register" on a course and "Speak to a priest" forms (website and app). */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'course', 'topic', 'phone', 'status', 'createdAt'],
    group: 'Records',
    description: 'Course registrations and requests to speak to a priest, from the website and the app.',
  },
  access: staffOnly,
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Course registration', value: 'course' },
        { label: 'Speak to a priest', value: 'priest' },
      ],
    },
    {
      name: 'course',
      type: 'text',
      admin: { condition: (d) => d?.type === 'course', description: 'The course they registered for' },
    },
    {
      name: 'topic',
      type: 'select',
      options: PRIEST_TOPICS,
      admin: { condition: (d) => d?.type === 'priest' },
    },
    {
      name: 'preferredMode',
      type: 'select',
      label: 'How they would like to speak',
      options: PRIEST_MODES,
      admin: { condition: (d) => d?.type === 'priest' },
    },
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'preferredTime', type: 'text', label: 'Best time to reach them' },
    { name: 'message', type: 'textarea', label: 'Question or details' },
    { name: 'consent', type: 'checkbox', label: 'Agreed to WhatsApp/SMS updates' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Done', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: ['website', 'app'],
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
