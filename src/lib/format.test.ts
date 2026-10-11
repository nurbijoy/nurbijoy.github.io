import { describe, expect, it } from 'vitest'
import { plural, relativeTime } from './format'

const NOW = Date.parse('2026-10-11T12:00:00Z')
const ago = (ms: number) => new Date(NOW - ms).toISOString()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('relativeTime', () => {
  it('uses minutes, hours, days, months, years', () => {
    expect(relativeTime(ago(5 * MIN), NOW)).toBe('5m ago')
    expect(relativeTime(ago(3 * HOUR), NOW)).toBe('3h ago')
    expect(relativeTime(ago(10 * DAY), NOW)).toBe('10d ago')
    expect(relativeTime(ago(90 * DAY), NOW)).toBe('3mo ago')
    expect(relativeTime(ago(800 * DAY), NOW)).toBe('2y ago')
  })

  it('never reports 0m or a negative time', () => {
    expect(relativeTime(ago(0), NOW)).toBe('1m ago')
    expect(relativeTime(new Date(NOW + HOUR).toISOString(), NOW)).toBe('1m ago')
  })
})

describe('plural', () => {
  it('pluralises by count', () => {
    expect(plural(1, 'event')).toBe('1 event')
    expect(plural(0, 'event')).toBe('0 events')
    expect(plural(2, 'day', 'days')).toBe('2 days')
  })
})
