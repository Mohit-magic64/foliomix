import { Fragment, type ReactNode } from "react"
import type { TemplateProps } from "./meta"
import { anton, plexMono } from "@/lib/fonts"
import { DEFAULT_SECTION_ORDER, period, socialLinks, type SectionId } from "@/lib/portfolio"

const kicker = "text-[11px] font-medium uppercase tracking-[0.25em]"

function Row({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="grid gap-4 border-t-2 border-current py-8 @3xl:grid-cols-[200px_1fr] @3xl:gap-10">
      <h2 className={kicker}>{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function Broadsheet({ data, sections = DEFAULT_SECTION_ORDER }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects, education } = data
  const socials = socialLinks(links)
  const display = anton.className

  const blocks: Record<SectionId, ReactNode> = {
    about: about ? (
      <Row id="about" title="About">
        <p className="text-[15px] leading-relaxed @3xl:columns-2 @3xl:gap-10 first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.8] first-letter:[font-family:var(--font-anton)]">
          {about}
        </p>
      </Row>
    ) : null,

    projects:
      projects.length > 0 ? (
        <Row id="work" title="Selected Work">
          <div className="divide-y divide-[var(--fm-accent,#1B2A6B)]/25">
            {projects.map((p, i) => (
              <a key={p.title} href={p.url || p.repoUrl || "#"} className="group grid grid-cols-[auto_1fr] gap-6 py-6 first:pt-0">
                <span className={`${display} text-4xl opacity-40`}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={`${display} text-3xl uppercase leading-none tracking-wide group-hover:underline @3xl:text-4xl`}>
                    {p.title}
                  </h3>
                  {p.description && <p className="mt-2 text-sm leading-relaxed">{p.description}</p>}
                  {p.tech.length > 0 && (
                    <p className="mt-3 text-[11px] uppercase tracking-widest opacity-70">{p.tech.join(" / ")}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </Row>
      ) : null,

    skills:
      skills.length > 0 ? (
        <Row title="Index">
          <p className="text-sm leading-loose">{skills.join(" · ")}</p>
        </Row>
      ) : null,

    experience:
      experience.length > 0 ? (
        <Row title="Career Ledger">
          <div className="divide-y divide-[var(--fm-accent,#1B2A6B)]/25">
            {experience.map((e, i) => (
              <div key={i} className="flex flex-col gap-1 py-4 first:pt-0 @3xl:flex-row @3xl:items-baseline @3xl:gap-6">
                <span className="w-36 shrink-0 text-xs uppercase tracking-widest opacity-70">{period(e)}</span>
                <div>
                  <span className={`${display} text-2xl uppercase tracking-wide`}>{e.role}</span>
                  <span className="text-sm"> — {e.company}</span>
                  {e.summary && <p className="mt-1 text-sm leading-relaxed">{e.summary}</p>}
                </div>
              </div>
            ))}
          </div>
        </Row>
      ) : null,

    education:
      education.length > 0 ? (
        <Row title="Schooling">
          <div className="space-y-3">
            {education.map((e) => (
              <p key={e.school} className="text-sm">
                <span className="font-medium">{e.school}</span>
                {(e.degree || e.year) && <span className="opacity-70"> — {[e.degree, e.year].filter(Boolean).join(", ")}</span>}
              </p>
            ))}
          </div>
        </Row>
      ) : null,

    contact: (
      <section id="contact" className="my-8 flex flex-col gap-6 bg-[var(--fm-accent,#1B2A6B)] p-8 text-[#F2EFE6] @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:p-12">
        <div className="min-w-0">
          <h2 className="text-[11px] uppercase tracking-[0.2em] opacity-70">Correspondence</h2>
          <a href={links.email ? `mailto:${links.email}` : "#"} className={`${display} mt-2 block break-all text-4xl uppercase @3xl:text-6xl`}>
            {links.email || "Say hello"}
          </a>
        </div>
        {socials.length > 0 && (
          <div className="flex gap-6 text-xs uppercase tracking-widest">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="hover:underline">{s.label}</a>
            ))}
          </div>
        )}
      </section>
    ),
  }

  return (
    <div className={`@container ${plexMono.className} ${anton.variable} bg-[#F2EFE6] text-[var(--fm-accent,#1B2A6B)]`}>
      <div className="mx-auto max-w-6xl px-6 py-8 @3xl:px-12 @3xl:py-10">
        {/* Masthead always stays on top */}
        <header className="pb-8">
          <div className="flex items-center justify-between border-b-2 border-current pb-3 text-[11px] uppercase tracking-[0.2em]">
            <span>The Portfolio Edition</span>
            <span className="hidden @3xl:inline">{location || "Worldwide"}</span>
            <span>No. 001</span>
          </div>
          <h1 className={`${display} mt-6 break-words text-[16cqw] uppercase leading-[0.82] @3xl:text-[12cqw]`}>
            {name || "Your Name"}
          </h1>
          {headline && (
            <p className="mt-6 border-y-2 border-current py-4 text-sm uppercase tracking-[0.15em] @3xl:text-base">{headline}</p>
          )}
        </header>

        {sections.map((id) => (
          <Fragment key={id}>{blocks[id]}</Fragment>
        ))}
      </div>
    </div>
  )
}