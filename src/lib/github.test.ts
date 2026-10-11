import { describe, expect, it } from 'vitest'
import { buildHeat, formatDay } from './github'

// Sunday, 11 Oct 2026. Local-time dates keep the test independent of the machine's timezone.
const TODAY = new Date(2026, 9, 11, 15)
const at = (y: number, m: number, d: number, h = 12) => ({ type: 'PushEvent', created_at: new Date(y, m, d, h).toISOString() })

describe('buildHeat', () => {
  const events = [at(2026, 9, 9), at(2026, 9, 9, 14), at(2026, 9, 9, 16), at(2026, 9, 5), at(2026, 6, 20)]
  const heat = buildHeat(events, 13, TODAY)

  it('covers exactly 13 whole weeks starting on a Sunday', () => {
    expect(heat.cells).toHaveLength(91)
    expect(heat.cells[0]!.row).toBe(0)
    expect(heat.cells[0]!.date.getDay()).toBe(0)
    expect(heat.cells[0]!.date.getMonth()).toBe(6) // Jul 19
    expect(heat.cells[0]!.date.getDate()).toBe(19)
  })

  it('counts events per day and totals them', () => {
    expect(heat.total).toBe(5)
    expect(heat.activeDays).toBe(3)
    expect(heat.max).toBe(3)
  })

  it('buckets by weekday and finds the busiest', () => {
    expect(heat.weekday.find((d) => d.label === 'Fri')!.count).toBe(3)
    // Oct 5 and Jul 20 are both Mondays (Jul 19, the window's first day, is a Sunday).
    expect(heat.weekday.find((d) => d.label === 'Mon')!.count).toBe(2)
    expect(heat.weekday[heat.busiestWeekday]!.label).toBe('Fri')
    expect(heat.weekday[heat.busiestWeekday]!.full).toBe('Friday')
  })

  it('totals weeks consistently with days', () => {
    expect(heat.weekly).toHaveLength(13)
    expect(heat.weekly.reduce((s, w) => s + w.count, 0)).toBe(heat.total)
  })

  it('marks days after today as future and never counts them', () => {
    const future = heat.cells.filter((c) => c.future)
    expect(future.length).toBeGreaterThan(0)
    expect(future.every((c) => c.count === 0)).toBe(true)
    expect(heat.cells.find((c) => c.date.getDate() === 11 && c.date.getMonth() === 9)!.future).toBe(false)
  })

  it('handles no events at all', () => {
    const empty = buildHeat([], 13, TODAY)
    expect(empty.total).toBe(0)
    expect(empty.max).toBe(0)
    expect(empty.activeDays).toBe(0)
  })

  it('ignores events older than the window', () => {
    expect(buildHeat([at(2025, 0, 1)], 13, TODAY).total).toBe(0)
  })
})

describe('formatDay', () => {
  it('formats weekday and date', () => {
    expect(formatDay(new Date(2026, 9, 9))).toBe('Fri, Oct 9')
  })
})
