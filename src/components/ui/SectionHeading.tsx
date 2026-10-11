import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface Props {
  index: string
  label: string
  title: ReactNode
  lede?: ReactNode
}

export function SectionHeading({ index, label, title, lede }: Props) {
  return (
    <Reveal className="mb-12 max-w-3xl md:mb-16">
      <p className="eyebrow flex items-center gap-3">
        <span className="text-accent-ink">{index}</span>
        <span aria-hidden className="h-px w-10 bg-line-strong" />
        <span>{label}</span>
      </p>
      <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.4rem)]">{title}</h2>
      {lede && <p className="lede mt-6 max-w-2xl">{lede}</p>}
    </Reveal>
  )
}
