import { EB_Garamond, Inter, Marcellus, Montserrat } from 'next/font/google'
import React from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { MobileDock } from '@/components/MobileDock'
import { Motion } from '@/components/Motion'
import { SocialLinks } from '@/components/SocialLinks'
import { TopBar } from '@/components/TopBar'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { getPayloadClient } from '@/lib/payload'
import './globals.css'

const marcellus = Marcellus({ subsets: ['latin'], weight: '400', variable: '--font-marcellus' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
// ISKCON identity manual: logo lettering is Adobe Garamond. EB Garamond is the free Garamond
// revival closest to it; swap for Adobe Garamond if the temple has an Adobe Fonts licence.
const garamond = EB_Garamond({ subsets: ['latin'], weight: '600', variable: '--font-garamond' })
// Header (top strip, menu, logo descriptor, Donate), sized and set like iskconattapur.com
const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-montserrat' })

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
    <html lang="en" className={`${marcellus.variable} ${inter.variable} ${garamond.variable} ${montserrat.variable}`}>
      <body>
        <TopBar sessions={sessions} socials={<SocialLinks settings={settings} />} />
        <Header socials={<SocialLinks settings={settings} gap={1.25} />} />
        <main>{children}</main>
        <Footer settings={settings} timings={timings} />
        {settings.whatsapp && <WhatsAppFloat number={settings.whatsapp} />}
        <MobileDock whatsapp={settings.whatsapp} phone={settings.phone} />
        <Motion />
      </body>
    </html>
  )
}
