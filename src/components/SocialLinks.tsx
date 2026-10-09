import type { SiteSetting } from '@/payload-types'
import { waLink } from '@/lib/format'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from './Icons'

export function SocialLinks({ settings, className = '' }: { settings: SiteSetting; className?: string }) {
  const links = [
    { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.youtube, label: 'YouTube', Icon: YoutubeIcon },
    { href: settings.whatsapp ? waLink(settings.whatsapp) : null, label: 'WhatsApp', Icon: WhatsAppIcon },
  ].filter((l) => l.href)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-saffron-300">
          <Icon />
        </a>
      ))}
    </div>
  )
}
