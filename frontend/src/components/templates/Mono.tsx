import type { TemplateProps } from "./meta"
import { period, socialLinks } from "@/lib/portfolio"

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{children}</p>
}

export default function Mono({ data }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects, education } = data
  const socials = socialLinks(links)

  return (
    <div className="@container relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-white/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-[35%] h-[460px] w-[460px] rounded-full bg-neutral-400/15 blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-6 py-8 @3xl:px-12">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm backdrop-blur-xl">
          <span className="font-medium">{name || "Your Name"}</span>
          <div className="flex gap-6 text-neutral-400">
            {projects.length > 0 && <a href="#work" className="hover:text-white">Work</a>}
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </nav>

        <header className="py-24 @3xl:py-36">
          {location && <Label>Based in {location}</Label>}
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight @3xl:text-8xl">
            {name || "Your Name"}
          </h1>
          {headline && (
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-400 @3xl:text-2xl">{headline}</p>
          )}
        </header>

        {projects.length > 0 && (
          <section id="work" className="pb-24">
            <Label>Selected work</Label>
            <div className="mt-8 grid gap-4 @3xl:grid-cols-2">
              {projects.map((p, i) => (
                <a
                  key={p.title}
                  href={p.url || p.repoUrl || "#"}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {p.stars ? <span>★ {p.stars}</span> : null}
                  </div>
                  <h3 className="mt-10 text-2xl font-medium">{p.title}</h3>
                  {p.description && <p className="mt-3 leading-relaxed text-neutral-400">{p.description}</p>}
                  {p.tech.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        <section id="about" className="grid gap-12 pb-24 @3xl:grid-cols-[1fr_1.4fr]">
          <div>
            <Label>About</Label>
            {skills.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">{s}</span>
                ))}
              </div>
            )}
            {education.length > 0 && (
              <div className="mt-10 space-y-3">
                {education.map((e) => (
                  <div key={e.school}>
                    <p className="font-medium">{e.school}</p>
                    <p className="text-sm text-neutral-500">{[e.degree, e.year].filter(Boolean).join(" · ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {about && <p className="text-2xl leading-relaxed text-neutral-300">{about}</p>}
            {experience.length > 0 && (
              <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
                {experience.map((e, i) => (
                  <div key={i} className="flex flex-col gap-1 py-5 @3xl:flex-row @3xl:justify-between">
                    <div>
                      <p className="font-medium">{e.role}</p>
                      <p className="text-sm text-neutral-500">{e.company}</p>
                    </div>
                    <p className="text-sm text-neutral-500">{period(e)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer id="contact" className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl @3xl:p-16">
          <p className="text-neutral-500">Have a project in mind?</p>
          <a href={links.email ? `mailto:${links.email}` : "#"} className="mt-4 block break-all text-3xl font-semibold tracking-tight @3xl:text-5xl">
            {links.email || "Let's talk"}
          </a>
          {socials.length > 0 && (
            <div className="mt-8 flex justify-center gap-6 text-sm text-neutral-400">
              {socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-white">{s.label}</a>
              ))}
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}