import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { DIVISIONS, DIVISION_BN, districts, type Division } from '@/data/bangladeshDistricts'
import { cn } from '@/lib/cn'
import { toBn } from '@/lib/bangla'
import { districtIdsIn } from '@/lib/travelMap'

interface Props {
  open: boolean
  /** The division shown when the picker opens. */
  division: Division
  visited: ReadonlySet<string>
  onApply: (next: ReadonlySet<string>) => void
  onClose: () => void
}

/** Multi-select districts, one division at a time. Esc or Cancel leaves the map untouched. */
export function DivisionPicker({ open, division, visited, onApply, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="division-picker-title">
      {open && <PickerBody division={division} visited={visited} onApply={onApply} onClose={onClose} />}
    </Modal>
  )
}

/**
 * Mounted only while the modal is open, so every opening starts from the map's current
 * districts. Ticks go into a draft that is written back only on Apply.
 */
function PickerBody({ division: first, visited, onApply, onClose }: Omit<Props, 'open'>) {
  const [active, setActive] = useState<Division>(first)
  const [draft, setDraft] = useState<Set<string>>(() => new Set(visited))

  const inActive = districts.filter((d) => d.division === active)
  const activeIds = districtIdsIn(active)
  const allInActive = activeIds.every((id) => draft.has(id))
  const selectedIn = (div: Division) => districtIdsIn(div).filter((id) => draft.has(id)).length

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setActiveDivision = (on: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev)
      for (const id of activeIds) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  return (
    <div className="p-6 pt-16 sm:p-8 sm:pt-16">
      <h3 id="division-picker-title" className="font-display text-2xl font-semibold tracking-tight">
        বিভাগ অনুযায়ী জেলা বাছুন
      </h3>
      <p className="mt-2 text-sm text-ink-2">
        যেসব জেলায় গিয়েছেন সবগুলোয় টিক দিন, যেকোনো বিভাগের জেলা মিলিয়ে। “প্রয়োগ করুন” চাপলে তবেই মানচিত্র বদলাবে।
      </p>

      <div role="group" aria-label="বিভাগ" className="mt-6 flex flex-wrap gap-2">
        {DIVISIONS.map((div) => (
          <button
            key={div}
            type="button"
            className="chip bn"
            aria-pressed={div === active}
            onClick={() => setActive(div)}
          >
            {DIVISION_BN[div]}
            <span className="opacity-60">
              {toBn(selectedIn(div))}/{toBn(districtIdsIn(div).length)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="bn text-base text-ink-2">
          {DIVISION_BN[active]} · {toBn(selectedIn(active))}/{toBn(activeIds.length)} নির্বাচিত
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => setActiveDivision(!allInActive)}>
          {allInActive ? 'এই বিভাগের সব মুছুন' : 'এই বিভাগের সব বাছুন'}
        </button>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {inActive.map((d) => {
          const on = draft.has(d.id)
          return (
            <li key={d.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  on ? 'border-accent-ink bg-surface-2' : 'border-line hover:border-line-strong',
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(d.id)}
                  className="size-4 shrink-0 accent-accent"
                />
                <span className="bn text-base text-ink">{d.nameBn}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="bn text-sm text-ink-2">
          মোট {toBn(draft.size)}/{toBn(districts.length)} জেলা নির্বাচিত
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            বাতিল
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onApply(draft)}>
            প্রয়োগ করুন
          </button>
        </div>
      </div>
    </div>
  )
}
