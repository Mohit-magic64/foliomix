import type { TemplateProps } from "./meta"
import { anton, plexMono } from "@/lib/fonts"
import { period, socialLinks } from "@/lib/portfolio"

const kicker = "text-[11px] font-medium uppercase tracking-[0.25em]"

export default function Broadsheet({ data }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects, education } = data
  const socials = socialLinks(links)
  const display = anton.className

  return (
    <div className={`@container ${plexMono.className} ${anton.variable} bg-[#F2EFE6] text-[#1B2A6B]`}>
      <div className="mx-auto max-w-6xl px-6 py-8 @3xl:px-12 @3xl:py-10">
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

        <div className="mt-10 grid gap-10 @3xl:grid-cols-3 @3xl:gap-0 @3xl:divide-x-2 @3xl:divide-[#1B2A6B]">
          <section className="@3xl:pr-8">
            <h2 className={kicker}>About</h2>
            {about && (
              <p className="mt-4 text-[15px] leading-relaxed first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.8] first-letter:[font-family:var(--font-anton)]">
                {about}
              </p>
            )}
            {skills.length > 0 && (
              <>
                <h2 className={`${kicker} mt-10`}>Index</h2>
                <p className="mt-4 text-sm leading-loose">{skills.join(" · ")}</p>
              </>
            )}
            {education.length > 0 && (
              <>
                <h2 className={`${kicker} mt-10`}>Schooling</h2>
                {education.map((e) => (
                  <p key={e.school} className="mt-3 text-sm">
                    <span className="font-medium">{e.school}</span>
                    <br />
                    {[e.degree, e.year].filter(Boolean).join(", ")}
                  </p>
                ))}
              </>
            )}
          </section>

          <section className="@3xl:col-span-2 @3xl:pl-8">
            <h2 className={kicker}>Selected Work</h2>
            <div className="mt-2 divide-y divide-[#1B2A6B]/25">
              {projects.map((p, i) => (
                <a key={p.title} href={p.url || p.repoUrl || "#"} className="group grid grid-cols-[auto_1fr] gap-6 py-6">
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
          </section>
        </div>

        {experience.length > 0 && (
          <section className="mt-14 border-t-2 border-current pt-6">
            <h2 className={kicker}>Career Ledger</h2>
            <div className="mt-2">
              {experience.map((e, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-[#1B2A6B]/25 py-4 @3xl:flex-row @3xl:items-baseline @3xl:gap-6">
                  <span className="w-44 shrink-0 text-xs uppercase tracking-widest opacity-70">{period(e)}</span>
                  <span className={`${display} text-2xl uppercase tracking-wide`}>{e.role}</span>
                  <span className="text-sm">— {e.company}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-14 flex flex-col gap-6 bg-[#1B2A6B] p-8 text-[#F2EFE6] @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:p-12">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">Correspondence</p>
            <a
              href={links.email ? `mailto:${links.email}` : "#"}
              className={`${display} mt-2 block break-all text-4xl uppercase @3xl:text-6xl`}
            >
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
        </footer>
      </div>
    </div>
  )
}