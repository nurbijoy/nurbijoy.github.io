/**
 * Chart colours, by role. All values are CSS variables (defined in index.css), so
 * every chart re-themes live with the light/dark toggle.
 *
 * Categorical order is fixed: orange → blue → aqua. That order was run through the
 * dataviz validator for both themes with the strict all-pairs test (worst CVD ΔE 9.2
 * light / 9.4 dark; normal-vision ΔE ≥ 20). Aqua is < 3:1 on the light surface, so any
 * chart using it must ship visible labels and a table view (the constellation does).
 */
export const C = {
  accent: 'var(--accent)', // categorical slot 1
  blue: 'var(--c2)', // slot 2
  aqua: 'var(--c3)', // slot 3

  ink: 'var(--ink)',
  ink2: 'var(--ink-2)',
  ink3: 'var(--ink-3)', // axis / tick text, de-emphasis marks
  grid: 'var(--line)', // hairline gridlines
  axis: 'var(--line-strong)', // baselines
  surface: 'var(--surface)',
} as const

/** Sequential single-hue ramp (blue). Dark mode flips the anchor so "none" recedes. */
export const HEAT = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'] as const

export const KIND_COLOR = { research: C.accent, concept: C.aqua, skill: C.blue } as const
export const KIND_LABEL = { research: 'Research direction', concept: 'Concept', skill: 'Skill' } as const

export const tickStyle = { fill: C.ink3, fontSize: 12, fontFamily: 'var(--font-mono)' } as const
