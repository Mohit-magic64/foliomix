import { Fragment, type ReactNode } from "react"
import type { TemplateProps } from "./meta"
import { bangers, spaceGrotesk } from "@/lib/fonts"
import { DEFAULT_SECTION_ORDER, period, socialLinks, type SectionId } from "@/lib/portfolio"

const panel = "border-4 border-black bg-white shadow-[6px_6px_0_#000]"
const stickerColors = ["bg-[var(--fm-accent,#E63946)] text-white", "bg-[#1D4ED8] text-white", "bg-white text-black"]
const tilt = [-3, 2, -1, 3]

// Starburst shape: 28 points alternating between outer and inner radius
const burst = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2
  const r = i % 2 === 0 ? 50 : 36
  return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`
}).join(", ")

export default function PopPanel({ data, sections = DEFAULT_SECTION_ORDER }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects, education } = data
  const display = bangers.className
  const socials = socialLinks(links)

  const blocks: Record<SectionId, ReactNode> = {
    about: about ? (
      <section className="mt-12 flex items-start gap-5">
        <div className={`${display} flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-black bg-[#1D4ED8] text-3xl text-white`}>
          {(name || "?")[0]}
        </div>
        <div className="relative flex-1 rounded-[32px] border-4 border-black bg-white p-6 shadow-[6px_6px_0_#000] @3xl:p-8">
          <span className="absolute -left-[14px] top-6 h-6 w-6 rotate-45 border-b-4 border-l-4 border-black bg-white" />
          <p className="relative text-lg leading-relaxed">{about}</p>
        </div>
      </section>
    ) : null,

    projects:
      projects.length > 0 ? (
        <section className="mt-12">
          <h2 className={`${display} text-5xl tracking-wide`}>The Work</h2>
          <div className="mt-6 grid gap-5 @3xl:grid-cols-3">
            {projects.map((p, i) => (
              <a
                key={p.title}
                href={p.url || p.repoUrl || "#"}
                className={`${panel} flex flex-col transition-transform hover:-translate-y-1 hover:-rotate-1`}
              >
                <span className="self-start border-b-4 border-r-4 border-black bg-[#FFD43B] px-3 py-1 text-xs font-bold">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className={`${display} text-3xl leading-none tracking-wide`}>{p.title}</h3>
                  {p.description && <p className="mt-3 flex-1 text-sm leading-relaxed">{p.description}</p>}
                  {p.tech.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span key={t} className="border-2 border-black px-2 py-0.5 text-[11px] font-bold uppercase">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null,

    skills:
      skills.length > 0 ? (
        <section className="mt-12">
          <h2 className={`${display} text-5xl tracking-wide`}>Super Powers</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {skills.map((s, i) => (
              <span
                key={s}
                className={`${stickerColors[i % 3]} border-4 border-black px-4 py-2 text-sm font-bold uppercase shadow-[4px_4px_0_#000]`}
                style={{ transform: `rotate(${tilt[i % 4]}deg)` }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      ) : null,

    experience:
      experience.length > 0 ? (
        <section className="mt-12">
          <h2 className={`${display} text-5xl tracking-wide`}>Origin Story</h2>
          <div className="mt-6 grid gap-5 @3xl:grid-cols-2">
            {experience.map((e, i) => (
              <div key={i} className={`${panel} p-5`}>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">{period(e)}</p>
                <h3 className={`${display} mt-2 text-3xl leading-none tracking-wide`}>{e.role}</h3>
                <p className="font-bold">{e.company}</p>
                {e.summary && <p className="mt-2 text-sm leading-relaxed">{e.summary}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education:
      education.length > 0 ? (
        <section className="mt-12">
          <h2 className={`${display} text-5xl tracking-wide`}>Training Arc</h2>
          <div className="mt-6 grid gap-5 @3xl:grid-cols-2">
            {education.map((e) => (
              <div key={e.school} className={`${panel} p-5`}>
                {e.year && <p className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">{e.year}</p>}
                <h3 className={`${display} mt-1 text-3xl leading-none tracking-wide`}>{e.school}</h3>
                {e.degree && <p className="font-bold">{e.degree}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    contact: (
      <section className={`${panel} mt-12 !bg-[#1D4ED8] p-8 text-center text-white @3xl:p-12`}>
        <h2 className={`${display} text-5xl tracking-wide @3xl:text-7xl`}>Let&apos;s Team Up!</h2>
        {links.email && (
          <a
            href={`mailto:${links.email}`}
            className="mt-6 inline-block break-all border-4 border-black bg-[#FFD43B] px-6 py-3 font-bold text-black shadow-[4px_4px_0_#000]"
          >
            {links.email}
          </a>
        )}
        {socials.length > 0 && (
          <div className="mt-6 flex justify-center gap-6 font-bold uppercase">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="underline decoration-4 underline-offset-4">{s.label}</a>
            ))}
          </div>
        )}
      </section>
    ),
  }

  return (
    <div
      className={`@container ${spaceGrotesk.className} bg-[#FFD43B] text-black`}
      style={{
        backgroundImage: "radial-gradient(rgba(0,0,0,0.14) 1.6px, transparent 1.6px)",
        backgroundSize: "14px 14px",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-10 @3xl:px-10 @3xl:py-14">
        {/* Header always stays on top */}
        <header className="grid gap-5 @3xl:grid-cols-[1.6fr_1fr]">
          <div className={`${panel} relative p-8 pt-14 @3xl:p-12 @3xl:pt-16`}>
            <span className="absolute left-0 top-0 border-b-4 border-r-4 border-black bg-[#FFD43B] px-4 py-1 text-sm font-bold uppercase">
              Issue #1{location ? ` · ${location}` : ""}
            </span>
            <p className={`${display} text-3xl text-[var(--fm-accent,#E63946)]`}>Hello! I&apos;m</p>
            <h1 className={`${display} mt-2 text-6xl leading-[0.9] tracking-wide @3xl:text-8xl`}>{name || "Your Name"}</h1>
            {headline && <p className="mt-6 text-lg font-medium @3xl:text-xl">{headline}</p>}
          </div>
          <div className={`${panel} relative flex min-h-[260px] items-center justify-center overflow-hidden !bg-[var(--fm-accent,#E63946)]`}>
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.25) 2px, transparent 2px)", backgroundSize: "12px 12px" }}
            />
            <div className="relative flex h-56 w-56 items-center justify-center bg-[#FFD43B]" style={{ clipPath: `polygon(${burst})` }}>
              <span className={`${display} -rotate-6 px-8 text-center text-4xl leading-none`}>
                {projects.length > 0 ? `${projects.length} Projects!` : "Pow!"}
              </span>
            </div>
          </div>
        </header>

        {sections.map((id) => (
          <Fragment key={id}>{blocks[id]}</Fragment>
        ))}
      </div>
    </div>
  )
}