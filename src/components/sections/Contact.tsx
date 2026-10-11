import { ArrowUpRight, Mail } from 'lucide-react'
import { site } from '@/data/site'
import { GithubIcon } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container-x">
        <Reveal>
          <div className="card relative overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-24">
            {/* concentric rings, centred behind the copy */}
            <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
              {[360, 560, 780, 1020].map((s, i) => (
                <span
                  key={s}
                  className="absolute rounded-full border border-line"
                  style={{ width: s, height: s, opacity: 1 - i * 0.2 }}
                />
              ))}
              <span className="absolute size-[28rem] rounded-full bg-accent/15 blur-[90px]" />
            </div>

            <div className="relative">
              <p className="eyebrow flex items-center justify-center gap-3">
                <span className="text-accent-ink">07</span>
                <span aria-hidden className="h-px w-10 bg-line-strong" />
                <span>Contact</span>
              </p>
              <h2 className="display mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,8vw,6.2rem)]">
                Let's build something
                <br />
                <span className="text-accent-ink">that holds up.</span>
              </h2>
              <p className="lede mx-auto mt-6 max-w-xl">
                Open to conversations about secure software, research collaboration and interesting problems. The fastest
                way to reach me is {site.email ? 'email or ' : ''}GitHub.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {site.email && (
                  <a href={`mailto:${site.email}`} className="btn btn-primary">
                    <Mail size={18} /> {site.email}
                  </a>
                )}
                <a
                  href={`https://github.com/${site.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={site.email ? 'btn btn-ghost' : 'btn btn-primary'}
                >
                  <GithubIcon size={18} /> github.com/{site.github} <ArrowUpRight size={17} className="arrow" />
                </a>
              </div>

              <p className="mt-10 flex items-center justify-center gap-2 text-sm text-ink-3">
                Tip: press <kbd className="kbd">Ctrl</kbd> <kbd className="kbd">K</kbd> anywhere to jump around.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
