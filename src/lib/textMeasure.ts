let context: CanvasRenderingContext2D | null | undefined

/**
 * Width of a Bangla name at a font size, in the same units as the size. It is measured at a large
 * size and scaled, so that small sizes stay exact. Needs the Hind Siliguri font to be loaded first.
 */
export function measureBangla(text: string, size: number): number {
  if (context === undefined) context = document.createElement('canvas').getContext('2d')
  if (!context) return text.length * size * 0.6
  const base = 100
  context.font = `700 ${base}px "Hind Siliguri", sans-serif`
  return (context.measureText(text).width * size) / base
}
