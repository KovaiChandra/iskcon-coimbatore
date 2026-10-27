import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            { name: 'address', type: 'textarea', required: true },
            { name: 'phone', type: 'text', required: true },
            {
              name: 'whatsapp',
              type: 'text',
              required: true,
              admin: { description: 'Digits with country code, e.g. 919042216108' },
            },
            { name: 'email', type: 'email', required: true },
            { name: 'mapUrl', type: 'text', label: 'Google Maps link' },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'whatsappChannel', type: 'text', label: 'WhatsApp channel link' },
          ],
        },
        {
          label: 'Donations',
          fields: [
            { name: 'reg80G', type: 'text', label: '80G registration number' },
            { name: 'reg80GValidity', type: 'text', label: '80G validity' },
            { name: 'upiId', type: 'text', label: 'UPI ID' },
            { name: 'upiQr', type: 'upload', relationTo: 'media', label: 'UPI QR code' },
            { name: 'bankDetails', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
