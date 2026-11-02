import { realLink, waLink, YOUTUBE_CHANNEL } from '@/lib/format'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from './Icons'
import styles from './SocialLinks.module.css'

/** `gap` is the space between icons in rem; `className` lets the parent set the colour. */
export function SocialLinks({ settings, className = '', gap }) {
  const links = [
    { href: realLink(settings.facebook), label: 'Facebook', Icon: FacebookIcon },
    { href: realLink(settings.instagram), label: 'Instagram', Icon: InstagramIcon },
    { href: realLink(settings.youtube) ?? YOUTUBE_CHANNEL, label: 'YouTube', Icon: YoutubeIcon },
    {
      href: settings.whatsapp ? waLink(settings.whatsapp) : null,
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
    },
  ].filter((l) => l.href)

  return (
    <div className={`${styles.links} ${className}`} style={gap ? { gap: `${gap}rem` } : undefined}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={styles.link}
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}
