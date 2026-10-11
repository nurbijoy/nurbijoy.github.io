import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Short name used in the message, e.g. "Skills". */
  label: string
  /** `section` swaps in a full-height block that keeps the anchor alive; `inline` is compact. */
  variant?: 'section' | 'inline'
  id?: string
}

interface State {
  error: Error | null
}

/** A chunk that fails to download (flaky network, stale deploy) looks like this. */
const isChunkError = (e: Error) => /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(e.message)

/**
 * Contains a failure to one section or chart so the rest of the page keeps working.
 * Lazy-chunk failures offer a reload; render errors offer a retry.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[${this.props.label}] failed to render`, error, info.componentStack)
  }

  private retry = () => {
    if (this.state.error && isChunkError(this.state.error)) {
      window.location.reload()
      return
    }
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const body = (
      <div role="alert" className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <TriangleAlert className="shrink-0 text-ink-3" size={26} />
        <div className="flex-1">
          <p className="font-medium">{this.props.label} couldn't load.</p>
          <p className="mt-1 text-sm text-ink-2">
            {isChunkError(error)
              ? 'The connection dropped while fetching this part of the page.'
              : 'Something went wrong rendering this part. The rest of the page is unaffected.'}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={this.retry}>
          <RotateCcw size={16} /> {isChunkError(error) ? 'Reload' : 'Try again'}
        </button>
      </div>
    )

    if (this.props.variant === 'inline') return body
    return (
      <section id={this.props.id} className="section">
        <div className="container-x">{body}</div>
      </section>
    )
  }
}
