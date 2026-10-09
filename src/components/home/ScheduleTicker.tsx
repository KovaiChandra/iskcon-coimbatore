import { Sparkle } from '@/components/art/Mandala'

export function ScheduleTicker({ items }: { items: { time: string; activity: string }[] }) {
  if (items.length === 0) return null
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-3 whitespace-nowrap px-6">
          <span className="font-semibold text-saffron-300">{t.time}</span>
          <span>{t.activity}</span>
          <Sparkle className="ml-6 size-2.5 text-saffron-500" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="overflow-hidden border-y border-saffron-500/30 bg-purple-900 py-3 text-sm text-purple-50">
      <div className="flex">
        <span className="shrink-0 border-r border-saffron-500/30 px-4 font-serif text-saffron-300 sm:px-6">Today at the temple</span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="marquee flex w-max">
            {row()}
            {row(true)}
          </div>
        </div>
      </div>
    </div>
  )
}
