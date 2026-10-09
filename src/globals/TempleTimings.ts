import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const TempleTimings: GlobalConfig = {
  slug: 'temple-timings',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'openSessions',
      type: 'array',
      required: true,
      admin: { description: 'When the temple is open. Drives the "Temple Open / Closed" status in the top bar. 24-hour time, e.g. 04:15.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'opens', type: 'text', required: true },
            { name: 'closes', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'schedule',
      type: 'array',
      admin: { description: 'Daily aarti and darshan schedule shown on the Contact page.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'time', type: 'text', required: true },
            { name: 'activity', type: 'text', required: true },
            { name: 'showInFooter', type: 'checkbox' },
          ],
        },
      ],
    },
  ],
}
