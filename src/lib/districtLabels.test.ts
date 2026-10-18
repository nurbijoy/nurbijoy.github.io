import { describe, expect, it } from 'vitest'
import { bestLabelLayout, layoutLabels, type LabelItem } from './districtLabels'

/** Every character is half the font size wide: predictable widths for the tests. */
const measure = (text: string, size: number) => text.length * size * 0.5
const bounds = { width: 200, height: 200 }

describe('layoutLabels', () => {
  it('places names that do not touch each other at their own spot', () => {
    const items: LabelItem[] = [
      { id: 'a', text: 'আ', x: 40, y: 40 },
      { id: 'b', text: 'আ', x: 160, y: 160 },
    ]
    const layout = layoutLabels(items, measure, 14, bounds)
    expect(layout.hidden).toEqual([])
    expect(layout.placed.find((p) => p.id === 'a')).toMatchObject({ x: 40, y: 40 })
  })

  it('moves a name off a crowded spot rather than overlapping', () => {
    const items: LabelItem[] = [
      { id: 'a', text: 'আআ', x: 100, y: 100 },
      { id: 'b', text: 'আআ', x: 100, y: 100 },
    ]
    const layout = layoutLabels(items, measure, 14, bounds)
    expect(layout.hidden).toEqual([])
    const [p, q] = layout.placed
    expect(p && q && (p.x !== q.x || p.y !== q.y)).toBe(true)
  })

  it('keeps every placed name inside the map', () => {
    const items: LabelItem[] = [{ id: 'edge', text: 'আআআ', x: 1, y: 1 }]
    const [p] = layoutLabels(items, measure, 14, bounds).placed
    expect(p).toBeDefined()
    const half = measure('আআআ', 14) / 2
    expect(p!.x - half).toBeGreaterThanOrEqual(0)
    expect(p!.y - 14 * 1.3 / 2).toBeGreaterThanOrEqual(0)
  })
})

describe('bestLabelLayout', () => {
  it('picks the largest size at which every name fits', () => {
    const items: LabelItem[] = [
      { id: 'a', text: 'আ', x: 40, y: 40 },
      { id: 'b', text: 'আ', x: 160, y: 160 },
    ]
    const layout = bestLabelLayout(items, measure, bounds, [18, 14])
    expect(layout.size).toBe(18)
    expect(layout.hidden).toEqual([])
  })

  it('falls back to the size that hides the fewest names when none fits everything', () => {
    // Two names in a tiny, crowded map: at no size can both fit.
    const tight = { width: 30, height: 30 }
    const items: LabelItem[] = [
      { id: 'a', text: 'আআআ', x: 15, y: 15 },
      { id: 'b', text: 'আআআ', x: 15, y: 15 },
    ]
    const layout = bestLabelLayout(items, measure, tight, [14, 12])
    expect(layout.hidden.length).toBeGreaterThan(0)
    expect(layout.placed.length + layout.hidden.length).toBe(2)
  })
})
