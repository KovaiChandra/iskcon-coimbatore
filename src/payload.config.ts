import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { SitePhotos } from './globals/SitePhotos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseUrl = process.env.DATABASE_URL || ''

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
  globals: [HomePage, SitePhotos, TempleTimings, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Postgres when DATABASE_URL is a postgres:// URL (Vercel/Neon); SQLite file for local development.
  db: databaseUrl.startsWith('postgres')
    ? postgresAdapter({
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations'),
      })
    : sqliteAdapter({ client: { url: databaseUrl } }),
  sharp,
  plugins: [
    // Uploads go to Vercel Blob when its token is set (production); otherwise to the local media/ folder.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      // Browser uploads straight to Blob, so large videos skip the 4.5 MB server request limit
      clientUploads: true,
    }),
  ],
})
