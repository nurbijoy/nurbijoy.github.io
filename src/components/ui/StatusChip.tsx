import type { ProjectStatus } from '@/data/projects'

/** Live gets a pulsing dot; every other status gets a hollow one. */
export function StatusChip({ status }: { status: ProjectStatus }) {
  return (
    <span className="tag gap-1.5">
      {status === 'Live' ? (
        <span className="pulse-dot !size-1.5" aria-hidden />
      ) : (
        <span aria-hidden className="size-1.5 rounded-full border border-ink-3" />
      )}
      {status}
    </span>
  )
}
