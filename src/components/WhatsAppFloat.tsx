import { waLink } from '@/lib/format'
import { WhatsAppIcon } from './Icons'

export function WhatsAppFloat({ number }: { number: string }) {
  return (
    <a
      href={waLink(number, 'Hare Krishna! I have a question.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
