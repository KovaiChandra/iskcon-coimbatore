import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

const nobody = () => false

/** Spam protection counters (lib/spam.js). Internal: not shown in the admin, not reachable by API. */
export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  admin: { hidden: true },
  access: { read: nobody, create: nobody, update: nobody, delete: nobody },
  timestamps: false,
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true },
    { name: 'windowStart', type: 'date', required: true, index: true },
  ],
}

/**
 * One row per page view, for Admin → Analytics (endpoints/track.ts). Anonymous: `visitor` is a
 * scramble that changes every day, so nobody can be followed from one day to the next.
 */
export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: { hidden: true },
  access: { read: authenticated, create: nobody, update: nobody, delete: nobody },
  timestamps: false,
  fields: [
    { name: 'day', type: 'text', required: true, index: true }, // YYYY-MM-DD, India time
    { name: 'path', type: 'text', required: true },
    { name: 'visitor', type: 'text', required: true },
    { name: 'device', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'country', type: 'text' },
  ],
}
