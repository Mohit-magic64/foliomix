export type Project = {
  title: string
  description: string
  url?: string
  repoUrl?: string
  tech: string[]
  stars?: number
}
export type Experience = { company: string; role: string; start: string; end?: string; summary: string }
export type Education = { school: string; degree: string; year?: string }

export type Portfolio = {
  name: string
  headline: string
  about: string
  avatarUrl?: string
  location?: string
  links: { github?: string; linkedin?: string; website?: string; email?: string }
  skills: string[]
  experience: Experience[]
  projects: Project[]
  education: Education[]
}

// Which sources were imported (file name or GitHub username)
export type Sources = { resume?: string; linkedin?: string; github?: string }

export const emptyPortfolio: Portfolio = {
  name: "",
  headline: "",
  about: "",
  links: {},
  skills: [],
  experience: [],
  projects: [],
  education: [],
}

export const samplePortfolio: Portfolio = {
  name: "Aarav Mehta",
  headline: "Product designer & front-end developer building calm, useful software.",
  about:
    "I design and build web products end to end, from the first sketch to shipped code. Lately I've been making tools that turn complicated data into something simple and friendly.",
  location: "Bengaluru, India",
  links: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    website: "https://example.com",
    email: "hello@example.com",
  },
  skills: ["TypeScript", "React", "Next.js", "Figma", "Node.js", "Tailwind CSS", "PostgreSQL", "Motion design"],
  experience: [
    { company: "Northwind Labs", role: "Senior Product Designer", start: "2023", summary: "Lead design for an analytics suite used by thousands of teams." },
    { company: "Pixel & Co.", role: "Front-end Developer", start: "2020", end: "2023", summary: "Built the company design system and shipped 30+ marketing pages." },
  ],
  projects: [
    { title: "Lumen UI", description: "An open-source React library with 40+ accessible components.", tech: ["React", "TypeScript"], stars: 342 },
    { title: "Tidepool", description: "A calm dashboard for tracking personal finances.", tech: ["Next.js", "D3"], stars: 128 },
    { title: "Wayfinder", description: "Turns saved links into a day-by-day travel itinerary.", tech: ["Node.js", "PostgreSQL"], stars: 57 },
  ],
  education: [{ school: "Riverside Institute of Technology", degree: "B.Des, Interaction Design", year: "2020" }],
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const strList = (v: unknown, max: number) =>
  Array.isArray(v) ? v.map(str).filter(Boolean).slice(0, max) : []

function list<T>(v: unknown, map: (x: Obj) => T | null): T[] {
  if (!Array.isArray(v)) return []
  return v.filter(isObj).map(map).filter((x): x is T => x !== null)
}

// Turns any messy input (AI output, database row) into a clean Portfolio
export function normalize(raw: unknown): Portfolio {
  const r = isObj(raw) ? raw : {}
  const links = isObj(r.links) ? r.links : {}
  return {
    name: str(r.name),
    headline: str(r.headline),
    about: str(r.about),
    avatarUrl: str(r.avatarUrl) || undefined,
    location: str(r.location) || undefined,
    links: {
      github: str(links.github) || undefined,
      linkedin: str(links.linkedin) || undefined,
      website: str(links.website) || undefined,
      email: str(links.email) || undefined,
    },
    skills: strList(r.skills, 40),
    experience: list(r.experience, (x) => {
      const company = str(x.company)
      const role = str(x.role)
      if (!company && !role) return null
      return { company, role, start: str(x.start), end: str(x.end) || undefined, summary: str(x.summary) }
    }),
    projects: list(r.projects, (x) => {
      const title = str(x.title)
      if (!title) return null
      return {
        title,
        description: str(x.description),
        url: str(x.url) || undefined,
        repoUrl: str(x.repoUrl) || undefined,
        tech: strList(x.tech, 8),
        stars: typeof x.stars === "number" ? x.stars : undefined,
      }
    }),
    education: list(r.education, (x) => {
      const school = str(x.school)
      if (!school) return null
      return { school, degree: str(x.degree), year: str(x.year) || undefined }
    }),
  }
}

const key = (s: string) => s.toLowerCase().trim()

function unionBy<T>(a: T[], b: T[], k: (x: T) => string): T[] {
  const seen = new Set(a.map(k))
  const out = [...a]
  for (const x of b) {
    const kk = k(x)
    if (!seen.has(kk)) {
      seen.add(kk)
      out.push(x)
    }
  }
  return out
}

// Existing details win; new imports fill gaps and add new items
export function mergePortfolio(base: Portfolio, inc: Portfolio): Portfolio {
  return {
    name: base.name || inc.name,
    headline: base.headline || inc.headline,
    about: base.about || inc.about,
    avatarUrl: base.avatarUrl || inc.avatarUrl,
    location: base.location || inc.location,
    links: {
      github: base.links.github || inc.links.github,
      linkedin: base.links.linkedin || inc.links.linkedin,
      website: base.links.website || inc.links.website,
      email: base.links.email || inc.links.email,
    },
    skills: unionBy(base.skills, inc.skills, key).slice(0, 40),
    experience: unionBy(base.experience, inc.experience, (e) => key(`${e.company}|${e.role}`)),
    projects: unionBy(base.projects, inc.projects, (p) => key(p.title)),
    education: unionBy(base.education, inc.education, (e) => key(e.school)),
  }
}

export function isEmpty(p: Portfolio) {
  return !p.name && p.projects.length === 0 && p.experience.length === 0 && p.skills.length === 0
}

export function withHttp(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function socialLinks(l: Portfolio["links"]) {
  const out: { label: string; href: string }[] = []
  if (l.github) out.push({ label: "GitHub", href: withHttp(l.github) })
  if (l.linkedin) out.push({ label: "LinkedIn", href: withHttp(l.linkedin) })
  if (l.website) out.push({ label: "Website", href: withHttp(l.website) })
  return out
}

export function period(e: Experience) {
  return [e.start, e.end || (e.start ? "Present" : "")].filter(Boolean).join(" – ")
}
// ---------- Fonts users can pick in the editor ----------
export const FONT_OPTIONS = [
  { id: "poppins", label: "Poppins" },
  { id: "inter", label: "Inter" },
  { id: "space-grotesk", label: "Space Grotesk" },
  { id: "syne", label: "Syne" },
  { id: "playfair", label: "Playfair" },
  { id: "dm-serif", label: "DM Serif" },
  { id: "fraunces", label: "Fraunces" },
  { id: "bebas", label: "Bebas Neue" },
  { id: "anton", label: "Anton" },
  { id: "bangers", label: "Bangers" },
  { id: "plex-mono", label: "IBM Plex Mono" },
  { id: "jetbrains", label: "JetBrains Mono" },
] as const

export type FontId = (typeof FONT_OPTIONS)[number]["id"]

// ---------- Page sections: order and visibility ----------
export const SECTION_IDS = ["about", "projects", "skills", "experience", "education", "contact"] as const
export type SectionId = (typeof SECTION_IDS)[number]
export type SectionSetting = { id: SectionId; visible: boolean }
export const DEFAULT_SECTION_ORDER: SectionId[] = [...SECTION_IDS]

export const SECTION_LABELS: Record<SectionId, string> = {
  about: "About",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  contact: "Contact",
}

// Cleans a saved list and adds any missing sections, so the list is always complete
export function resolveSections(saved?: { id: string; visible?: boolean }[]): SectionSetting[] {
  const valid: readonly string[] = SECTION_IDS
  const out: SectionSetting[] = []
  for (const s of saved ?? []) {
    if (valid.includes(s.id) && !out.some((o) => o.id === s.id)) {
      out.push({ id: s.id as SectionId, visible: s.visible !== false })
    }
  }
  for (const id of SECTION_IDS) {
    if (!out.some((o) => o.id === id)) out.push({ id, visible: true })
  }
  return out
}

// Just the visible section ids, in order — this is what templates receive
export function visibleSections(saved?: SectionSetting[]): SectionId[] {
  return resolveSections(saved).filter((s) => s.visible).map((s) => s.id)
}

// ---------- Theme: the user's style choices ----------
export type Theme = {
  headingFont?: FontId
  bodyFont?: FontId
  accent?: string
  sections?: SectionSetting[]
}

export function normalizeTheme(raw: unknown): Theme {
  const r = isObj(raw) ? raw : {}
  const ids: string[] = FONT_OPTIONS.map((f) => f.id)
  const font = (v: unknown) => (typeof v === "string" && ids.includes(v) ? (v as FontId) : undefined)
  const accent =
    typeof r.accent === "string" && /^#[0-9a-f]{6}$/i.test(r.accent) ? r.accent : undefined
  const sections = Array.isArray(r.sections)
    ? resolveSections(r.sections.filter(isObj).map((s) => ({ id: String(s.id), visible: s.visible !== false })))
    : undefined
  return { headingFont: font(r.headingFont), bodyFont: font(r.bodyFont), accent, sections }
}
// ---------- Public links (slugs) ----------
const RESERVED_SLUGS = [
  "api", "admin", "app", "auth", "about", "dashboard", "editor",
  "help", "login", "p", "settings", "templates", "www",
]

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30)
}

export function slugError(slug: string): string | null {
  if (slug.length < 3) return "Use at least 3 characters."
  if (slug.length > 30) return "Use 30 characters or fewer."
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return "Use lowercase letters, numbers, and hyphens (not at the start or end)."
  }
  if (RESERVED_SLUGS.includes(slug)) return "That name is reserved. Try another."
  return null
}