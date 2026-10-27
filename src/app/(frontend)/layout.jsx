import { Inter, Marcellus } from 'next/font/google'
import React from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SocialLinks } from '@/components/SocialLinks'
import { TopBar } from '@/components/TopBar'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { getPayloadClient } from '@/lib/payload'
import '@/styles/theme.css'
import './globals.css'
import '@/styles/buttons.css'

const marcellus = Marcellus({ subsets: ['latin'], weight: '400', variable: '--font-marcellus' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: {
    default: 'ISKCON Coimbatore · Sri Jagannath Mandir',
    template: '%s · ISKCON Coimbatore',
  },
  description:
    'Sri Jagannath Mandir, ISKCON Coimbatore. Daily darshan, festivals, courses, Annadaan and seva opportunities.',
}

export default async function RootLayout({ children }) {
  const payload = await getPayloadClient()
  const [settings, timings] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'temple-timings' }),
  ])
  const sessions = (timings.openSessions ?? []).map(({ opens, closes }) => ({ opens, closes }))

  return (
    <html lang="en" className={`${marcellus.variable} ${inter.variable}`}>
      <body>
        <TopBar sessions={sessions} />
        <Header
          socials={<SocialLinks settings={settings} gap={1.25} />}
          headerSocials={<SocialLinks settings={settings} gap={0.5} />}
        />
        <main>{children}</main>
        <Footer settings={settings} timings={timings} />
        {settings.whatsapp && <WhatsAppFloat number={settings.whatsapp} />}
      </body>
    </html>
  )
}
