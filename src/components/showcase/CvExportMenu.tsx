import { useEffect, useId, useRef, useState, type ComponentType } from 'react'
import { ChevronDown, Download, FileCode, FileText, FileType, LoaderCircle, Printer } from 'lucide-react'

export type CvExportFormat = 'pdf' | 'docx' | 'tex' | 'md'

const OPTIONS: { format: CvExportFormat; label: string; hint: string; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { format: 'pdf', label: 'PDF', hint: 'Opens the print dialog — choose “Save as PDF”', icon: Printer },
  { format: 'docx', label: 'Word (.docx)', hint: 'Editable in Word, Google Docs or Pages', icon: FileText },
  { format: 'tex', label: 'LaTeX (.tex)', hint: 'Compile in Overleaf or with pdflatex', icon: FileCode },
  { format: 'md', label: 'Markdown (.md)', hint: 'Plain text for GitHub, Notion or notes', icon: FileType },
]

interface Props {
  onExport: (format: CvExportFormat) => void
  /** Shown while a format is being prepared (the Word library loads on first use). */
  busy: boolean
}

/**
 * The CV builder's Export button: a menu of formats. Arrow keys, Home/End move through it;
 * Esc, Tab or a click outside close it, and focus returns to the button on Esc.
 */
export function CvExportMenu({ onExport, busy }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    items()[0]?.focus()

    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        button.current?.focus()
      } else if (e.key === 'Tab') {
        setOpen(false)
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        const list = items()
        const at = list.indexOf(document.activeElement as HTMLElement)
        const next =
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? list.length - 1
              : (at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
        list[next]?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative ml-auto">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        className="btn btn-primary gap-1.5 text-xs font-semibold disabled:opacity-70"
      >
        {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}
        {busy ? 'Preparing…' : 'Export'}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Export CV as"
          className="absolute top-full right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line-strong bg-surface p-1.5 shadow-lg"
        >
          {OPTIONS.map(({ format, label, hint, icon: Icon }) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onExport(format)
              }}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
            >
              <Icon size={16} className="mt-0.5 shrink-0 text-accent-ink" />
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-ink">{label}</span>
                <span className="text-[0.7rem] leading-snug text-ink-3">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
