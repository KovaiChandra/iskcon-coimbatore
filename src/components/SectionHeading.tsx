export function SectionHeading({ eyebrow, title, intro, center }: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-600">{eyebrow}</p>}
      <h2 className="text-3xl md:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-muted">{intro}</p>}
    </div>
  )
}
