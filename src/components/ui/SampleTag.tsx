/** Marks placeholder content. Drop `sample: true` from the data entry to remove it. */
export function SampleTag() {
  return (
    <span
      className="tag border-dashed"
      title="Placeholder content. Replace this entry in src/data to make it yours."
    >
      Sample
    </span>
  )
}
