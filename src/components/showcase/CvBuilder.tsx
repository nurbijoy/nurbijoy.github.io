import { useState, type CSSProperties } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Eye,
  FolderGit2,
  GraduationCap,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from 'lucide-react'
import {
  academicSamplePreset,
  blankPreset,
  DEFAULT_SECTION_VISIBILITY,
  professionalSamplePreset,
  type CvData,
  type CvDensity,
  type CvMode,
  type CvSectionVisibility,
  type CvStyle,
} from '@/data/cvDefaults'
import {
  cvFileName,
  cvSections,
  downloadFile,
  exportToLatex,
  exportToMarkdown,
  type CvExportOptions,
  type CvSectionKey,
} from '@/lib/cvExport'
import { CvExportMenu, type CvExportFormat } from './CvExportMenu'
import './CvBuilder.css'

const ACCENT_COLORS = [
  { label: 'Brand Orange', value: '#d95926' },
  { label: 'Oxford Navy', value: '#1d4ed8' },
  { label: 'Burgundy', value: '#881337' },
  { label: 'Forest Emerald', value: '#047857' },
  { label: 'Charcoal Minimal', value: '#1f2937' },
]

export function CvBuilder() {
  const [data, setData] = useState<CvData>(academicSamplePreset)
  const [mode, setMode] = useState<CvMode>('academic')
  const [style, setStyle] = useState<CvStyle>('academic-latex')
  const [density, setDensity] = useState<CvDensity>('normal')
  const [accentColor, setAccentColor] = useState<string>('#d95926')
  const [visibility, setVisibility] = useState<CvSectionVisibility>(DEFAULT_SECTION_VISIBILITY.academic)

  // Mobile / Tab view toggle: 'editor' or 'preview'
  const [viewTab, setViewTab] = useState<'editor' | 'preview'>('preview')

  // Editor accordion open states
  const [openSection, setOpenSection] = useState<string>('basics')

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Headings of the sections on show; the preview and every export read the same list.
  const sectionTitle: Partial<Record<CvSectionKey, string>> = Object.fromEntries(
    cvSections(data, mode, visibility).map((s) => [s.key, s.title]),
  )

  const handleExport = async (format: CvExportFormat) => {
    setExportError(null)
    const opts: CvExportOptions = { mode, visibility, style, density, accent: accentColor }
    const name = cvFileName(data.basics.name)
    if (format === 'pdf') {
      // Browsers name the saved PDF after the page title.
      const title = document.title
      document.title = name.replace(/-/g, ' ')
      window.addEventListener('afterprint', () => (document.title = title), { once: true })
      window.print()
    } else if (format === 'tex') {
      downloadFile(exportToLatex(data, opts), `${name}.tex`, 'application/x-tex')
    } else if (format === 'md') {
      downloadFile(exportToMarkdown(data, opts), `${name}.md`, 'text/markdown')
    } else {
      setExporting(true)
      try {
        const { cvToDocx } = await import('@/lib/cvDocx')
        downloadFile(await cvToDocx(data, opts), `${name}.docx`)
      } catch (err) {
        setExportError(`Could not create the Word file: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setExporting(false)
      }
    }
  }

  const handleModeChange = (newMode: CvMode) => {
    setMode(newMode)
    setVisibility(DEFAULT_SECTION_VISIBILITY[newMode])
    if (newMode === 'academic') {
      setStyle('academic-latex')
    } else {
      setStyle('modern-sans')
    }
  }

  // Helpers to update fields
  const updateBasics = (field: keyof CvData['basics'], val: unknown) => {
    setData((d) => ({ ...d, basics: { ...d.basics, [field]: val } }))
  }

  const toggleVisibility = (sec: keyof CvSectionVisibility) => {
    setVisibility((v) => ({ ...v, [sec]: !v[sec] }))
  }

  return (
    <div className="cv-builder-root flex flex-col gap-6">
      {/* ────────────────── Top Control Toolbar (No Print) ────────────────── */}
      <div className="cv-no-print flex flex-col gap-4 rounded-xl border border-line-strong bg-surface p-4 shadow-sm md:p-6">
        {/* Row 1: Presets & Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-3">Profile Presets:</span>
            <button
              type="button"
              className="chip gap-1.5 text-xs font-medium"
              onClick={() => {
                setData(academicSamplePreset)
                handleModeChange('academic')
              }}
            >
              <GraduationCap size={14} className="text-accent-ink" />
              Academic Sample
            </button>
            <button
              type="button"
              className="chip gap-1.5 text-xs font-medium"
              onClick={() => {
                setData(professionalSamplePreset)
                handleModeChange('professional')
              }}
            >
              <Briefcase size={14} className="text-accent-ink" />
              Software Engineer Sample
            </button>
            <button
              type="button"
              className="chip text-xs text-ink-3"
              onClick={() => setData(blankPreset)}
            >
              <RotateCcw size={12} />
              Reset Blank
            </button>
          </div>

          <CvExportMenu onExport={(format) => void handleExport(format)} busy={exporting} />
          {exportError && (
            <p role="alert" className="w-full text-right text-xs text-red-500">
              {exportError}
            </p>
          )}
        </div>

        {/* Row 2: Target CV Mode, Styling, and Density */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Academic vs Professional Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-line-strong bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => handleModeChange('academic')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'academic' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <GraduationCap size={15} className={mode === 'academic' ? 'text-accent-ink' : ''} />
              Academic CV
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('professional')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'professional' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <Briefcase size={15} className={mode === 'professional' ? 'text-accent-ink' : ''} />
              Professional CV / Resume
            </button>
          </div>

          {/* Style & Color options */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink-3">Layout Style:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as CvStyle)}
                className="rounded-md border border-line-strong bg-surface px-2.5 py-1 text-xs text-ink focus:outline-none"
              >
                <option value="academic-latex">LaTeX Academic (Serif)</option>
                <option value="modern-sans">Modern Tech (Sans)</option>
                <option value="swiss-clean">Swiss Minimal (Clean)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink-3">Density:</span>
              <button
                type="button"
                className={`chip text-xs !py-1 ${density === 'compact' ? '!border-accent !text-accent-ink' : ''}`}
                onClick={() => setDensity(density === 'compact' ? 'normal' : 'compact')}
              >
                {density === 'compact' ? 'Compact (1-Page)' : 'Standard'}
              </button>
            </div>

            {/* Accent color picker */}
            <div className="flex items-center gap-1">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setAccentColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`size-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    accentColor === c.value ? 'border-ink scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Editor / Preview switch on small screens, where the two can't sit side by side */}
        <div className="flex items-center gap-1 border-t border-line pt-4 lg:hidden">
          <button
            type="button"
            className={`chip text-xs font-semibold ${viewTab === 'editor' ? '!bg-surface-2 !text-ink' : ''}`}
            onClick={() => setViewTab('editor')}
          >
            Form Editor
          </button>
          <button
            type="button"
            className={`chip text-xs font-semibold ${viewTab === 'preview' ? '!bg-surface-2 !text-ink' : ''}`}
            onClick={() => setViewTab('preview')}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* ────────────────── Main Editor & Preview Grid ────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Form Editor (Accordion) */}
        <div
          className={`cv-no-print flex flex-col gap-3 lg:col-span-5 ${
            viewTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="font-display text-sm font-semibold text-ink">Form Editor & Sections</span>
            <span className="text-xs text-ink-3">Live updates reflect immediately</span>
          </div>

          {/* Accordion 1: Basics & Contact */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 'basics' ? '' : 'basics')}
              className="flex w-full items-center justify-between text-left text-xs font-bold text-ink"
            >
              <span className="flex items-center gap-2">
                <User size={15} className="text-accent-ink" />
                Basics & Contact
              </span>
              {openSection === 'basics' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSection === 'basics' && (
              <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3 text-xs">
                <div>
                  <label className="text-ink-3">Full Name</label>
                  <input
                    type="text"
                    value={data.basics.name}
                    onChange={(e) => updateBasics('name', e.target.value)}
                    className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                  />
                </div>
                <div>
                  <label className="text-ink-3">Professional Headline / Subtitle</label>
                  <input
                    type="text"
                    value={data.basics.headline}
                    onChange={(e) => updateBasics('headline', e.target.value)}
                    className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-ink-3">Email</label>
                    <input
                      type="email"
                      value={data.basics.email}
                      onChange={(e) => updateBasics('email', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-3">Phone</label>
                    <input
                      type="text"
                      value={data.basics.phone}
                      onChange={(e) => updateBasics('phone', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-ink-3">Location / Country</label>
                    <input
                      type="text"
                      value={data.basics.location}
                      onChange={(e) => updateBasics('location', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-3">Website / Portfolio</label>
                    <input
                      type="text"
                      value={data.basics.website}
                      onChange={(e) => updateBasics('website', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-ink-3">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://www.linkedin.com/in/username/"
                      value={data.basics.linkedin}
                      onChange={(e) => updateBasics('linkedin', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-3">GitHub Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/username"
                      value={data.basics.github}
                      onChange={(e) => updateBasics('github', e.target.value)}
                      className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1 text-ink"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-ink-3">Professional or Research Summary</label>
                  <textarea
                    rows={3}
                    value={data.basics.summary}
                    onChange={(e) => updateBasics('summary', e.target.value)}
                    className="mt-1 w-full rounded border border-line-strong bg-surface-2 px-2.5 py-1.5 text-ink"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Research Interests (Academic mode) */}
          {mode === 'academic' && (
            <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'research' ? '' : 'research')}
                  className="flex items-center gap-2 text-left text-xs font-bold text-ink"
                >
                  <Sparkles size={15} className="text-accent-ink" />
                  Research Interests
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibility.researchInterests}
                    onChange={() => toggleVisibility('researchInterests')}
                    aria-label="Show research interests"
                    className="accent-accent"
                  />
                  {openSection === 'research' ? (
                    <ChevronUp
                      size={16}
                      onClick={() => setOpenSection('')}
                      className="cursor-pointer text-ink-3"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      onClick={() => setOpenSection('research')}
                      className="cursor-pointer text-ink-3"
                    />
                  )}
                </div>
              </div>

              {openSection === 'research' && (
                <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-xs">
                  <p className="text-ink-3">Enter each research direction on a separate line:</p>
                  <textarea
                    rows={4}
                    value={data.basics.researchInterests.join('\n')}
                    onChange={(e) =>
                      updateBasics(
                        'researchInterests',
                        e.target.value.split('\n').filter((x) => x.trim().length > 0),
                      )
                    }
                    className="w-full rounded border border-line-strong bg-surface-2 p-2 text-ink"
                  />
                </div>
              )}
            </div>
          )}

          {/* Accordion 3: Education (with CGPA / Major / Location) */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'education' ? '' : 'education')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <GraduationCap size={15} className="text-accent-ink" />
                Education ({data.education.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.education}
                  onChange={() => toggleVisibility('education')}
                  aria-label="Show education"
                  className="accent-accent"
                />
                {openSection === 'education' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('education')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'education' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete education"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          education: prev.education.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-2 pr-5">
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Institution</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University or MIT"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              education: prev.education.map((item, i) =>
                                i === idx ? { ...item, institution: val } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Degree</label>
                          <input
                            type="text"
                            placeholder="e.g. Bachelor of Science (B.Sc.)"
                            value={edu.degree}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, degree: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Field / Major</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Science & Engineering"
                            value={edu.field}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, field: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[0.7rem] font-semibold text-accent-ink">CGPA / Grade</label>
                          <input
                            type="text"
                            placeholder="e.g. 3.82 / 4.00"
                            value={edu.gpa ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, gpa: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-accent/40 bg-surface px-2 py-1 text-ink font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Dates</label>
                          <input
                            type="text"
                            placeholder="e.g. 2020 – 2024"
                            value={`${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ''}`}
                            onChange={(e) => {
                              const val = e.target.value
                              const parts = val.split(/–|-/)
                              setData((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        startDate: parts[0]?.trim() ?? '',
                                        endDate: parts[1]?.trim() ?? '',
                                      }
                                    : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Chittagong, Bangladesh"
                            value={edu.location ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, location: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[0.7rem] text-ink-3">Honors, Thesis or Specializations</label>
                        <input
                          type="text"
                          placeholder="e.g. Major in Systems & Security, Competitive Programming Lead"
                          value={edu.details ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              education: prev.education.map((item, i) =>
                                i === idx ? { ...item, details: val } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      education: [
                        ...prev.education,
                        {
                          id: `edu-${Date.now()}`,
                          institution: '',
                          degree: 'B.Sc. in Computer Science',
                          field: 'Computer Science',
                          startDate: '2020',
                          endDate: '2024',
                          gpa: '3.80 / 4.00',
                          location: '',
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Education Entry
                </button>
              </div>
            )}
          </div>

          {/* Accordion 4: Experience */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'experience' ? '' : 'experience')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <Briefcase size={15} className="text-accent-ink" />
                Work & Research Experience ({data.experience.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.experience}
                  onChange={() => toggleVisibility('experience')}
                  aria-label="Show experience"
                  className="accent-accent"
                />
                {openSection === 'experience' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('experience')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'experience' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete experience"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-2 pr-5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Role / Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            value={exp.role}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item, i) =>
                                  i === idx ? { ...item, role: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Company / Organization</label>
                          <input
                            type="text"
                            placeholder="e.g. Security & Systems Lab"
                            value={exp.company}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item, i) =>
                                  i === idx ? { ...item, company: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Dates</label>
                          <input
                            type="text"
                            placeholder="e.g. 2024 – Present"
                            value={`${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}`}
                            onChange={(e) => {
                              const val = e.target.value
                              const parts = val.split(/–|-/)
                              setData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        startDate: parts[0]?.trim() ?? '',
                                        endDate: parts[1]?.trim() ?? '',
                                      }
                                    : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Remote / Dhaka"
                            value={exp.location ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item, i) =>
                                  i === idx ? { ...item, location: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Responsibilities & Key Achievements (one per line):</label>
                        <textarea
                          rows={3}
                          value={exp.bullets.join('\n')}
                          onChange={(e) => {
                            const bullets = e.target.value.split('\n').filter((x) => x.trim().length > 0)
                            setData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item, i) =>
                                i === idx ? { ...item, bullets } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Technologies (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. TypeScript, Solidity, Python, WebCrypto"
                          value={exp.technologies.join(', ')}
                          onChange={(e) => {
                            const tech = e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                            setData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item, i) =>
                                i === idx ? { ...item, technologies: tech } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      experience: [
                        ...prev.experience,
                        {
                          id: `exp-${Date.now()}`,
                          role: '',
                          company: '',
                          startDate: '2024',
                          endDate: 'Present',
                          bullets: [],
                          technologies: [],
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Experience Entry
                </button>
              </div>
            )}
          </div>

          {/* Accordion 5: Publications */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'publications' ? '' : 'publications')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <BookOpen size={15} className="text-accent-ink" />
                Publications & Preprints ({data.publications.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.publications}
                  onChange={() => toggleVisibility('publications')}
                  aria-label="Show publications"
                  className="accent-accent"
                />
                {openSection === 'publications' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('publications')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'publications' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.publications.map((pub, idx) => (
                  <div key={pub.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete publication"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          publications: prev.publications.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-2 pr-5">
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Paper / Publication Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Reentrancy by Design: A Taxonomy..."
                          value={pub.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              publications: prev.publications.map((item, i) =>
                                i === idx ? { ...item, title: val } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Authors List</label>
                        <input
                          type="text"
                          placeholder="e.g. Nur Mohammad Bijoy, Co-Authors"
                          value={pub.authors}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              publications: prev.publications.map((item, i) =>
                                i === idx ? { ...item, authors: val } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Venue / Conference</label>
                          <input
                            type="text"
                            placeholder="e.g. Conference on Machine Learning for Security"
                            value={pub.venue}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                publications: prev.publications.map((item, i) =>
                                  i === idx ? { ...item, venue: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Year</label>
                          <input
                            type="text"
                            placeholder="e.g. 2026"
                            value={pub.year}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                publications: prev.publications.map((item, i) =>
                                  i === idx ? { ...item, year: val } : item,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">DOI or Paper URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://doi.org/... or GitHub link"
                          value={pub.doiOrUrl ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              publications: prev.publications.map((item, i) =>
                                i === idx ? { ...item, doiOrUrl: val } : item,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      publications: [
                        ...prev.publications,
                        {
                          id: `pub-${Date.now()}`,
                          title: '',
                          authors: data.basics.name,
                          venue: '',
                          year: new Date().getFullYear().toString(),
                          type: 'Preprint',
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Publication Entry
                </button>
              </div>
            )}
          </div>

          {/* Accordion 6: Selected Projects */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'projects' ? '' : 'projects')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <FolderGit2 size={15} className="text-accent-ink" />
                Selected Projects ({data.projects.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.projects}
                  onChange={() => toggleVisibility('projects')}
                  aria-label="Show projects"
                  className="accent-accent"
                />
                {openSection === 'projects' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('projects')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'projects' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.projects.map((proj, idx) => (
                  <div key={proj.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete project"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-2 pr-5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Project Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Vaultline"
                            value={proj.name}
                            onChange={(e) => {
                              const val = e.target.value
                              setData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx ? { ...p, name: val } : p,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[0.7rem] text-ink-3">Role / Year</label>
                          <input
                            type="text"
                            placeholder="e.g. Creator · 2026"
                            value={`${proj.role ? proj.role : ''}${proj.year ? ` · ${proj.year}` : ''}`}
                            onChange={(e) => {
                              const val = e.target.value
                              const parts = val.split('·')
                              setData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx
                                    ? {
                                        ...p,
                                        role: parts[0]?.trim() ?? '',
                                        year: parts[1]?.trim() ?? '',
                                      }
                                    : p,
                                ),
                              }))
                            }}
                            className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Description</label>
                        <input
                          type="text"
                          placeholder="Brief description of the project"
                          value={proj.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p, i) =>
                                i === idx ? { ...p, description: val } : p,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Highlights (one per line)</label>
                        <textarea
                          rows={2}
                          value={proj.bullets.join('\n')}
                          onChange={(e) => {
                            const bullets = e.target.value.split('\n').filter((x) => x.trim().length > 0)
                            setData((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p, i) =>
                                i === idx ? { ...p, bullets } : p,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-ink-3">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. TypeScript, WebCrypto, Argon2, React"
                          value={proj.stack.join(', ')}
                          onChange={(e) => {
                            const stack = e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                            setData((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p, i) =>
                                i === idx ? { ...p, stack } : p,
                              ),
                            }))
                          }}
                          className="mt-0.5 w-full rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      projects: [
                        ...prev.projects,
                        {
                          id: `proj-${Date.now()}`,
                          name: 'New Project',
                          description: '',
                          bullets: [],
                          stack: [],
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Project Entry
                </button>
              </div>
            )}
          </div>

          {/* Accordion 7: Skills */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'skills' ? '' : 'skills')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <Wrench size={15} className="text-accent-ink" />
                Technical Competencies ({data.skills.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.skills}
                  onChange={() => toggleVisibility('skills')}
                  aria-label="Show skills"
                  className="accent-accent"
                />
                {openSection === 'skills' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('skills')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'skills' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.skills.map((skillCat, idx) => (
                  <div key={skillCat.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete skill category"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          skills: prev.skills.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-1.5 pr-5">
                      <input
                        type="text"
                        placeholder="Category Name (e.g. Security & Cryptography)"
                        value={skillCat.category}
                        onChange={(e) => {
                          const val = e.target.value
                          setData((prev) => ({
                            ...prev,
                            skills: prev.skills.map((item, i) =>
                              i === idx ? { ...item, category: val } : item,
                            ),
                          }))
                        }}
                        className="rounded border border-line bg-surface px-2 py-1 font-semibold text-ink"
                      />
                      <input
                        type="text"
                        placeholder="Skills (comma separated)"
                        value={skillCat.items.join(', ')}
                        onChange={(e) => {
                          const items = e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                          setData((prev) => ({
                            ...prev,
                            skills: prev.skills.map((item, i) =>
                              i === idx ? { ...item, items } : item,
                            ),
                          }))
                        }}
                        className="rounded border border-line bg-surface px-2 py-1 text-ink"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      skills: [
                        ...prev.skills,
                        {
                          id: `skill-${Date.now()}`,
                          category: 'New Category',
                          items: [],
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Skill Category
                </button>
              </div>
            )}
          </div>

          {/* Accordion 8: Honors & Awards */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'awards' ? '' : 'awards')}
                className="flex items-center gap-2 text-left text-xs font-bold text-ink"
              >
                <Award size={15} className="text-accent-ink" />
                Honors & Awards ({data.awards.length})
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibility.awards}
                  onChange={() => toggleVisibility('awards')}
                  aria-label="Show awards"
                  className="accent-accent"
                />
                {openSection === 'awards' ? (
                  <ChevronUp
                    size={16}
                    onClick={() => setOpenSection('')}
                    className="cursor-pointer text-ink-3"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    onClick={() => setOpenSection('awards')}
                    className="cursor-pointer text-ink-3"
                  />
                )}
              </div>
            </div>

            {openSection === 'awards' && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-xs">
                {data.awards.map((aw, idx) => (
                  <div key={aw.id} className="relative rounded-lg border border-line bg-surface-2 p-3">
                    <button
                      type="button"
                      aria-label="Delete award"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          awards: prev.awards.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-2 right-2 text-ink-3 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex flex-col gap-2 pr-5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Award Title"
                          value={aw.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setData((prev) => ({
                              ...prev,
                              awards: prev.awards.map((a, i) => (i === idx ? { ...a, title: val } : a)),
                            }))
                          }}
                          className="rounded border border-line bg-surface px-2 py-1 text-ink font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="Issuer / Year"
                          value={`${aw.issuer}${aw.year ? ` · ${aw.year}` : ''}`}
                          onChange={(e) => {
                            const val = e.target.value
                            const parts = val.split('·')
                            setData((prev) => ({
                              ...prev,
                              awards: prev.awards.map((a, i) =>
                                i === idx
                                  ? { ...a, issuer: parts[0]?.trim() ?? '', year: parts[1]?.trim() ?? '' }
                                  : a,
                              ),
                            }))
                          }}
                          className="rounded border border-line bg-surface px-2 py-1 text-ink"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description / Context"
                        value={aw.description ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setData((prev) => ({
                            ...prev,
                            awards: prev.awards.map((a, i) => (i === idx ? { ...a, description: val } : a)),
                          }))
                        }}
                        className="rounded border border-line bg-surface px-2 py-1 text-ink"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      awards: [
                        ...prev.awards,
                        {
                          id: `award-${Date.now()}`,
                          title: '',
                          issuer: '',
                          year: new Date().getFullYear().toString(),
                        },
                      ],
                    }))
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs text-ink-2 hover:border-accent hover:text-ink"
                >
                  <Plus size={14} /> Add Award Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Printable Sheet Preview */}
        <div
          className={`flex flex-col items-center lg:col-span-7 ${
            viewTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="cv-no-print mb-2 flex w-full max-w-[820px] items-center justify-between px-2 text-xs text-ink-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye size={13} className="text-accent-ink" />
              Live Preview (Standard A4 Paper)
            </span>
            <span>Printed PDF matches this layout identically</span>
          </div>

          {/* The A4 Canvas Sheet (Strict Print Colors) */}
          <div
            id="cv-print-area"
            style={{ '--cv-accent': accentColor } as CSSProperties}
            className={`cv-preview-sheet cv-style-${style === 'academic-latex' ? 'latex' : style === 'modern-sans' ? 'modern' : 'swiss'} cv-density-${density} p-8 sm:p-12`}
          >
            {/* Header: Name & Contact info */}
            <div className="border-b border-[#e2e8f0] pb-4 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                {data.basics.name || 'Your Full Name'}
              </h1>
              {data.basics.headline && (
                <p className="mt-1 text-sm font-medium italic text-[#334155] sm:text-base">
                  {data.basics.headline}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#475569]">
                {[
                  data.basics.email,
                  data.basics.phone,
                  data.basics.location,
                  data.basics.website && (
                    <a href={data.basics.website} target="_blank" rel="noreferrer" className="text-[var(--cv-accent,#d95926)] font-medium">
                      Portfolio
                    </a>
                  ),
                  data.basics.linkedin && (
                    <a href={data.basics.linkedin} target="_blank" rel="noreferrer" className="text-[var(--cv-accent,#d95926)] font-medium">
                      LinkedIn
                    </a>
                  ),
                  data.basics.github && (
                    <a href={data.basics.github} target="_blank" rel="noreferrer" className="text-[var(--cv-accent,#d95926)] font-medium">
                      GitHub
                    </a>
                  ),
                ]
                  .filter(Boolean)
                  .map((item, i) => (
                    // Separator only between items, so a missing email leaves no leading "·".
                    <span key={i}>
                      {i > 0 && '· '}
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            {/* Research Interests (Academic Mode) */}
            {sectionTitle.researchInterests && (
              <section className="cv-break-inside-avoid mt-4">
                <h2 className="cv-section-title">{sectionTitle.researchInterests}</h2>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  {data.basics.researchInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className={
                        style === 'modern-sans'
                          ? 'rounded bg-[#f1f5f9] px-2 py-0.5 text-[#1e293b] font-medium'
                          : 'text-[#1e293b] after:content-[","] last:after:content-[""]'
                      }
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Summary (Especially Professional Mode) */}
            {sectionTitle.summary && (
              <section className="cv-break-inside-avoid mt-4">
                <h2 className="cv-section-title">{sectionTitle.summary}</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#1e293b]">{data.basics.summary}</p>
              </section>
            )}

            {/* Education (with Prominent CGPA / Major / Honors) */}
            {sectionTitle.education && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.education}</h2>
                <div className="flex flex-col gap-3">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="cv-item cv-break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-[#0f172a] text-sm">{edu.institution}</span>
                        <span className="text-xs font-medium text-[#64748b]">
                          {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mt-0.5">
                        <span className="italic font-medium text-[#1e293b]">
                          {edu.degree}
                          {edu.field ? `, ${edu.field}` : ''}
                        </span>
                        {edu.location && <span className="text-xs text-[#64748b] italic">{edu.location}</span>}
                      </div>
                      {edu.gpa && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#0f172a]">
                          <span className="font-bold">CGPA / Grade:</span>
                          <span className="font-semibold text-[var(--cv-accent,#d95926)]">{edu.gpa}</span>
                        </div>
                      )}
                      {edu.details && <p className="mt-0.5 text-xs text-[#475569]">{edu.details}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Publications (Academic CV priority) */}
            {sectionTitle.publications && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.publications}</h2>
                <div className="flex flex-col gap-2.5">
                  {data.publications.map((pub, idx) => (
                    <div key={pub.id} className="cv-item cv-break-inside-avoid text-xs">
                      <p className="text-[#1e293b] leading-relaxed">
                        <span className="font-bold text-[#0f172a]">{idx + 1}. </span>
                        {pub.authors && <span className="font-semibold text-[#0f172a]">{pub.authors}, </span>}
                        <span className="italic font-medium text-[#0f172a]">"{pub.title}," </span>
                        {pub.venue && <span className="text-[#334155]">{pub.venue}, </span>}
                        {pub.year && <span className="text-[#64748b]">{pub.year}.</span>}
                        {pub.doiOrUrl && (
                          <a
                            href={pub.doiOrUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 text-[var(--cv-accent,#d95926)] font-medium hover:underline"
                          >
                            [Link]
                          </a>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Work & Research Experience */}
            {sectionTitle.experience && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.experience}</h2>
                <div className="flex flex-col gap-3.5">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="cv-item cv-break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-[#0f172a] text-sm">
                          {exp.role}
                          {exp.role && exp.company && ' · '}
                          <span className="font-normal italic text-[#334155]">{exp.company}</span>
                        </span>
                        <span className="text-xs font-medium text-[#64748b]">
                          {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      {exp.location && <p className="text-xs text-[#64748b] italic">{exp.location}</p>}
                      {exp.bullets.length > 0 && (
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#1e293b]">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      )}
                      {exp.technologies.length > 0 && (
                        <p className="mt-1 text-xs text-[#475569]">
                          <span className="font-bold text-[#0f172a]">Technologies: </span>
                          {exp.technologies.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {sectionTitle.projects && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.projects}</h2>
                <div className="flex flex-col gap-3">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="cv-item cv-break-inside-avoid text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-[#0f172a] text-sm">
                          {proj.name}
                          {proj.role ? ` · ${proj.role}` : ''}
                        </span>
                        {proj.year && <span className="text-xs text-[#64748b]">{proj.year}</span>}
                      </div>
                      <p className="text-[#1e293b] mt-0.5">{proj.description}</p>
                      {proj.bullets.length > 0 && (
                        <ul className="mt-1 list-disc pl-4 text-[#1e293b] space-y-0.5">
                          {proj.bullets.map((pb, pbIdx) => (
                            <li key={pbIdx}>{pb}</li>
                          ))}
                        </ul>
                      )}
                      {proj.stack.length > 0 && (
                        <p className="mt-1 text-[#475569]">
                          <span className="font-bold text-[#0f172a]">Stack: </span>
                          {proj.stack.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Competencies / Skills */}
            {sectionTitle.skills && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.skills}</h2>
                <div className="flex flex-col gap-2 text-xs">
                  {data.skills.map((cat) => (
                    <div key={cat.id} className="cv-break-inside-avoid">
                      <span className="font-bold text-[#0f172a]">{cat.category}: </span>
                      <span className="text-[#1e293b]">{cat.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Honors & Awards */}
            {sectionTitle.awards && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.awards}</h2>
                <div className="flex flex-col gap-2 text-xs">
                  {data.awards.map((aw) => (
                    <div key={aw.id} className="cv-break-inside-avoid flex justify-between">
                      <div>
                        <span className="font-bold text-[#0f172a]">{aw.title}</span>
                        {aw.issuer && <span className="text-[#334155]"> · {aw.issuer}</span>}
                        {aw.description && <p className="text-[#64748b] mt-0.5">{aw.description}</p>}
                      </div>
                      <span className="text-[#64748b]">{aw.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications (Professional mode priority) */}
            {sectionTitle.certifications && (
              <section className="mt-4">
                <h2 className="cv-section-title">{sectionTitle.certifications}</h2>
                <div className="flex flex-col gap-2 text-xs">
                  {data.certifications.map((c) => (
                    <div key={c.id} className="cv-break-inside-avoid flex justify-between">
                      <div>
                        <span className="font-bold text-[#0f172a]">{c.name}</span>
                        {c.issuer && <span className="text-[#334155]"> · {c.issuer}</span>}
                      </div>
                      <span className="text-[#64748b]">{c.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
