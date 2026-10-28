import type { TemplateProps } from "./meta"
import { jetbrains } from "@/lib/fonts"
import { period, socialLinks } from "@/lib/portfolio"

const green = "text-[#4ADE80]"

// Makes a fake 7-character "commit hash" from text (same input = same hash)
function shortHash(s: string) {
  let h = 7
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h.toString(16).padStart(7, "0").slice(0, 7)
}

function Prompt({ user, cmd }: { user: string; cmd: string }) {
  return (
    <p className="mt-10 first:mt-0">
      <span className={green}>{user}@folio</span>
      <span className="text-neutral-500">:~$ </span>
      <span className="text-white">{cmd}</span>
    </p>
  )
}

export default function Terminal({ data }: TemplateProps) {
  const { name, headline, about, location, links, skills, experience, projects } = data
  const socials = socialLinks(links)
  const handle = (
    links.github?.split("/").filter(Boolean).pop() ||
    name.split(" ")[0] ||
    "dev"
  ).toLowerCase()

  return (
    <div className={`@container ${jetbrains.className} bg-[#0B0F0C] px-4 py-10 text-[#C8F7D4] @3xl:px-10 @3xl:py-16`}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#1E3A2A] bg-[#0F1712] shadow-[0_0_80px_rgba(74,222,128,0.08)]">
        <div className="flex items-center gap-2 border-b border-[#1E3A2A] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#1E3A2A]" />
          <span className="h-3 w-3 rounded-full bg-[#1E3A2A]" />
          <span className="h-3 w-3 rounded-full bg-[#1E3A2A]" />
          <span className="ml-3 text-xs text-neutral-500">~/{handle} — portfolio</span>
        </div>

        <div className="p-6 text-sm leading-relaxed @3xl:p-10 @3xl:text-[15px]">
          <Prompt user={handle} cmd="whoami" />
          <h1 className={`mt-3 text-3xl font-bold ${green} @3xl:text-5xl`}>{name || "Your Name"}</h1>
          {headline && <p className="mt-2 text-neutral-300">{headline}</p>}
          {location && <p className="text-neutral-500"># {location}</p>}

          {about && (
            <>
              <Prompt user={handle} cmd="cat about.md" />
              <p className="mt-3 max-w-2xl text-neutral-300">{about}</p>
            </>
          )}

          {projects.length > 0 && (
            <>
              <Prompt user={handle} cmd="ls ~/projects --sort=stars" />
              <div className="mt-3 space-y-3">
                {projects.map((p) => (
                  <a key={p.title} href={p.url || p.repoUrl || "#"} className="-mx-2 block rounded-md px-2 py-1 hover:bg-[#4ADE80]/10">
                    <div className="flex flex-wrap items-baseline gap-x-4">
                      <span className="text-neutral-600">drwxr-xr-x</span>
                      {typeof p.stars === "number" && <span className="text-yellow-300">★ {p.stars}</span>}
                      <span className={`font-bold ${green}`}>{p.title}/</span>
                    </div>
                    {p.description && <p className="text-neutral-400">{p.description}</p>}
                    {p.tech.length > 0 && <p className="text-xs text-cyan-300">[{p.tech.join(", ")}]</p>}
                  </a>
                ))}
              </div>
            </>
          )}

          {skills.length > 0 && (
            <>
              <Prompt user={handle} cmd="echo $SKILLS" />
              <p className="mt-3 text-neutral-300">{skills.join("  ")}</p>
            </>
          )}

          {experience.length > 0 && (
            <>
              <Prompt user={handle} cmd="git log --career" />
              <div className="mt-3 space-y-4">
                {experience.map((e, i) => (
                  <div key={i}>
                    <p className="text-yellow-300">
                      commit {shortHash(e.company + e.role)} <span className="text-neutral-500">({period(e)})</span>
                    </p>
                    <p className="text-white">{e.role} @ {e.company}</p>
                    {e.summary && <p className="pl-4 text-neutral-400">{e.summary}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          <Prompt user={handle} cmd="contact --all" />
          <div className="mt-3 space-y-1">
            {links.email && (
              <p>
                <span className="text-neutral-500">email    → </span>
                <a href={`mailto:${links.email}`} className={`${green} hover:underline`}>{links.email}</a>
              </p>
            )}
            {socials.map((s) => (
              <p key={s.label}>
                <span className="text-neutral-500">{s.label.toLowerCase().padEnd(9, " ")}→ </span>
                <a href={s.href} className={`${green} hover:underline`}>{s.href.replace(/^https?:\/\//, "")}</a>
              </p>
            ))}
          </div>

          <p className="mt-10">
            <span className={green}>{handle}@folio</span>
            <span className="text-neutral-500">:~$ </span>
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#4ADE80]" />
          </p>
        </div>
      </div>
    </div>
  )
}