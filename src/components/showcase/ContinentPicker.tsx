import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { CONTINENT_BN, countries, type Continent } from '@/data/worldCountries'
import { cn } from '@/lib/cn'
import { toBn } from '@/lib/bangla'
import { CONTINENT_ORDER, countryIdsIn, TOTAL_COUNTRIES } from '@/lib/worldTour'

interface Props {
  open: boolean
  /** The continent shown when the picker opens. */
  continent: Continent
  visited: ReadonlySet<string>
  onApply: (next: ReadonlySet<string>) => void
  onClose: () => void
}

/** Multi-select countries, one continent at a time. Esc or Cancel leaves the map untouched. */
export function ContinentPicker({ open, continent, visited, onApply, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="continent-picker-title">
      {open && <PickerBody continent={continent} visited={visited} onApply={onApply} onClose={onClose} />}
    </Modal>
  )
}

/**
 * Mounted only while the modal is open, so every opening starts from the map's current
 * countries. Ticks go into a draft that is written back only on Apply.
 */
function PickerBody({ continent: first, visited, onApply, onClose }: Omit<Props, 'open'>) {
  const [active, setActive] = useState<Continent>(first)
  const [draft, setDraft] = useState<Set<string>>(() => new Set(visited))

  const inActive = countries.filter((c) => c.continent === active)
  const activeIds = countryIdsIn(active)
  const allInActive = activeIds.every((id) => draft.has(id))
  const selectedIn = (cont: Continent) => countryIdsIn(cont).filter((id) => draft.has(id)).length

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setActiveContinent = (on: boolean) => {
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
      <h3 id="continent-picker-title" className="font-display text-2xl font-semibold tracking-tight">
        মহাদেশ অনুযায়ী দেশ বাছুন
      </h3>
      <p className="mt-2 text-sm text-ink-2">
        যেসব দেশে গিয়েছেন সবগুলোয় টিক দিন, যেকোনো মহাদেশের দেশ মিলিয়ে। “প্রয়োগ করুন” চাপলে তবেই মানচিত্র বদলাবে।
      </p>

      <div role="group" aria-label="মহাদেশ" className="mt-6 flex flex-wrap gap-2">
        {CONTINENT_ORDER.map((cont) => (
          <button
            key={cont}
            type="button"
            className="chip bn"
            aria-pressed={cont === active}
            onClick={() => setActive(cont)}
          >
            {CONTINENT_BN[cont]}
            <span className="opacity-60">
              {toBn(selectedIn(cont))}/{toBn(countryIdsIn(cont).length)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="bn text-base text-ink-2">
          {CONTINENT_BN[active]} · {toBn(selectedIn(active))}/{toBn(activeIds.length)} নির্বাচিত
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => setActiveContinent(!allInActive)}>
          {allInActive ? 'এই মহাদেশের সব মুছুন' : 'এই মহাদেশের সব বাছুন'}
        </button>
      </div>

      <ul className="mt-4 grid max-h-[46vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {inActive.map((c) => {
          const on = draft.has(c.id)
          return (
            <li key={c.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors',
                  on ? 'border-accent-ink bg-surface-2' : 'border-line hover:border-line-strong',
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(c.id)}
                  className="size-4 shrink-0 accent-accent"
                />
                <span className="bn text-base text-ink">{c.nameBn}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="bn text-sm text-ink-2">
          মোট {toBn(draft.size)}/{toBn(TOTAL_COUNTRIES)} দেশ নির্বাচিত
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
