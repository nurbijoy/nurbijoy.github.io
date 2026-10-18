const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Writes Latin digits as Bangla digits, e.g. 20 → "২০". Other characters pass through. */
export function toBn(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => BANGLA_DIGITS[Number(digit)]!)
}
