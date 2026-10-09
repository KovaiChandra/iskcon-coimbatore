import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Sevas } from './collections/Sevas'
import { Festivals } from './collections/Festivals'
import { Services } from './collections/Services'
import { Courses } from './collections/Courses'
import { Posts } from './collections/Posts'
import { DarshanDays } from './collections/DarshanDays'
import { ContactMessages, Donations, Subscribers, Volunteers } from './collections/Submissions'
import { SiteSettings } from './globals/SiteSettings'
import { TempleTimings } from './globals/TempleTimings'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · ISKCON Coimbatore' },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    DarshanDays,
    Festivals,
    Sevas,
    Services,
    Courses,
    Posts,
    Media,
    Donations,
    Subscribers,
    Volunteers,
    ContactMessages,
    Users,
  ],
  globals: [HomePage, TempleTimings, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // SQLite for local development; switch to @payloadcms/db-postgres before deploying.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
