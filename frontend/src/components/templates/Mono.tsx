import { Fragment, type ReactNode } from "react"
import type { TemplateProps } from "./meta"
import { DEFAULT_SECTION_ORDER, period, socialLinks, type SectionId } from "@/lib/portfolio"

function Label({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-normal uppercase tracking-[0.3em] text-neutral-500">{children}</h2>
}

function Row({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
  return (
    <section id={id} className="grid gap-6 pb-24 @3xl:grid-cols-[1fr_2fr] @3xl:gap-12">
      <Label>{label}</Label>
      <div>{children}</div>
    </section>
  )
}

export default function Mono({ data, sections = DEFAULT_SECTION_ORDER }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects, education } = data
  const socials = socialLinks(links)

  // One block per section; empty sections return null and are skipped
  const blocks: Record<SectionId, ReactNode> = {
    about: about ? (
      <Row id="about" label="About">
        <p className="text-2xl leading-relaxed text-neutral-300">{about}</p>
      </Row>
    ) : null,

    projects:
      projects.length > 0 ? (
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
      ) : null,

    skills:
      skills.length > 0 ? (
        <Row label="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">{s}</span>
            ))}
          </div>
        </Row>
      ) : null,

    experience:
      experience.length > 0 ? (
        <Row label="Experience">
          <div className="divide-y divide-white/10 border-y border-white/10">
            {experience.map((e, i) => (
              <div key={i} className="flex flex-col gap-1 py-5 @3xl:flex-row @3xl:justify-between @3xl:gap-8">
                <div>
                  <p className="font-medium">{e.role}</p>
                  <p className="text-sm text-neutral-500">{e.company}</p>
                  {e.summary && <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">{e.summary}</p>}
                </div>
                <p className="shrink-0 text-sm text-neutral-500">{period(e)}</p>
              </div>
            ))}
          </div>
        </Row>
      ) : null,

    education:
      education.length > 0 ? (
        <Row label="Education">
          <div className="space-y-4">
            {education.map((e) => (
              <div key={e.school}>
                <p className="font-medium">{e.school}</p>
                <p className="text-sm text-neutral-500">{[e.degree, e.year].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </Row>
      ) : null,

    contact: (
      <section id="contact" className="mb-24 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl @3xl:p-16">
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
      </section>
    ),
  }

  // Menu links only for sections that are visible and have content
  const nav = [
    sections.includes("projects") && projects.length > 0 ? { href: "#work", label: "Work" } : null,
    sections.includes("about") && about ? { href: "#about", label: "About" } : null,
    sections.includes("contact") ? { href: "#contact", label: "Contact" } : null,
  ].filter((x): x is { href: string; label: string } => x !== null)

  return (
    <div className="@container relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-white/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-[35%] h-[460px] w-[460px] rounded-full bg-neutral-400/15 blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-6 py-8 @3xl:px-12">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm backdrop-blur-xl">
          <span className="font-medium">{name || "Your Name"}</span>
          <div className="flex gap-6 text-neutral-400">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-white">{n.label}</a>
            ))}
          </div>
        </nav>

        <header className="py-24 @3xl:py-36">
          {location && <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Based in {location}</p>}
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight @3xl:text-8xl">{name || "Your Name"}</h1>
          {headline && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-400 @3xl:text-2xl">{headline}</p>}
        </header>

        {sections.map((id) => (
          <Fragment key={id}>{blocks[id]}</Fragment>
        ))}
      </div>
    </div>
  )
}