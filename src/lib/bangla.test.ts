import { describe, expect, it } from 'vitest'
import { toBn } from './bangla'

describe('toBn', () => {
  it('writes Latin digits as Bangla digits', () => {
    expect(toBn(20)).toBe('২০')
    expect(toBn(64)).toBe('৬৪')
    expect(toBn(0)).toBe('০')
  })

  it('leaves text and punctuation alone', () => {
    expect(toBn('31%')).toBe('৩১%')
    expect(toBn('2/8')).toBe('২/৮')
    expect(toBn('Rahim')).toBe('Rahim')
  })
})
