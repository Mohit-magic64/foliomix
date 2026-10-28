"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import RenderPortfolio from "@/components/templates/RenderPortfolio"
import { templateMeta } from "@/components/templates/meta"
import { fontFamilies } from "@/lib/fonts"
import {
  FONT_OPTIONS,
  slugError,
  type Education,
  type Experience,
  type FontId,
  type Portfolio,
  type Project,
  type Theme,
} from "@/lib/portfolio"
import LivePreview from "./LivePreview"
import SectionsPanel from "./SectionsPanel"
import { AddButton, Field, ItemCard, Section, TagInput, TextArea } from "./fields"

type Initial = { data: Portfolio; theme: Theme; templateId: string; slug: string | null; published: boolean }
type SaveState = "saved" | "unsaved" | "saving" | "error"

const ACCENTS = ["#E63946", "#F97316", "#FACC15", "#4ADE80", "#14B8A6", "#3B82F6", "#1B2A6B", "#A855F7", "#EC4899", "#111111"]

export default function Editor({ initial, suggestedSlug }: { initial: Initial; suggestedSlug: string }) {
  const [data, setData] = useState(initial.data)
  const [theme, setTheme] = useState(initial.theme)
  const [templateId, setTemplateId] = useState(initial.templateId)
  const [tab, setTab] = useState<"content" | "sections" | "style">("content")
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")
  const [saveState, setSaveState] = useState<SaveState>("saved")
  const [publishOpen, setPublishOpen] = useState(false)
  const [published, setPublished] = useState(initial.published)
  const [liveSlug, setLiveSlug] = useState(initial.slug)

  // ---------- Autosave: waits 0.8s after the last change, then saves ----------
  const latest = useRef({ data: initial.data, theme: initial.theme, templateId: initial.templateId })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function flush() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    setSaveState("saving")
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latest.current),
      })
      setSaveState(!res.ok ? "error" : timer.current ? "unsaved" : "saved")
      return res.ok
    } catch {
      setSaveState("error")
      return false
    }
  }

  function queueSave() {
    setSaveState("unsaved")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, 800)
  }

  function updateData(next: Portfolio) {
    setData(next)
    latest.current.data = next
    queueSave()
  }
  function updateTheme(next: Theme) {
    setTheme(next)
    latest.current.theme = next
    queueSave()
  }
  function updateTemplate(id: string) {
    setTemplateId(id)
    latest.current.templateId = id
    queueSave()
  }

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (saveState === "saved") return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [saveState])

  // ---------- Helpers for editing fields and lists ----------
  const set = <K extends keyof Portfolio>(key: K, value: Portfolio[K]) => updateData({ ...data, [key]: value })
  const setLink = (key: keyof Portfolio["links"], value: string) =>
    updateData({ ...data, links: { ...data.links, [key]: value } })

  function listOps<T extends object>(key: "projects" | "experience" | "education", blank: T) {
    const list = data[key] as unknown as T[]
    const save = (next: T[]) => updateData({ ...data, [key]: next } as Portfolio)
    return {
      list,
      add: () => save([...list, blank]),
      remove: (i: number) => save(list.filter((_, j) => j !== i)),
      moveUp: (i: number) => {
        if (i === 0) return
        const next = [...list]
        ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
        save(next)
      },
      edit: (i: number, patch: Partial<T>) => save(list.map((x, j) => (j === i ? { ...x, ...patch } : x))),
    }
  }

  const projects = listOps<Project>("projects", { title: "", description: "", tech: [] })
  const jobs = listOps<Experience>("experience", { company: "", role: "", start: "", summary: "" })
  const schools = listOps<Education>("education", { school: "", degree: "" })
  const meta = templateMeta.find((t) => t.id === templateId)

  // ---------- Content tab ----------
  const contentPanel = (
    <>
      <Section title="Basics">
        <Field label="Full name" value={data.name} onChange={(v) => set("name", v)} placeholder="Your name" />
        <Field label="Headline" value={data.headline} onChange={(v) => set("headline", v)} placeholder="Designer & developer building useful things" />
        <TextArea label="About you" value={data.about} onChange={(v) => set("about", v)} placeholder="A few sentences about what you do." />
        <Field label="Location" value={data.location ?? ""} onChange={(v) => set("location", v)} placeholder="City, Country" />
      </Section>

      <Section title="Links">
        <Field label="Email" type="email" value={data.links.email ?? ""} onChange={(v) => setLink("email", v)} placeholder="you@example.com" />
        <Field label="GitHub" value={data.links.github ?? ""} onChange={(v) => setLink("github", v)} placeholder="https://github.com/username" />
        <Field label="LinkedIn" value={data.links.linkedin ?? ""} onChange={(v) => setLink("linkedin", v)} placeholder="https://linkedin.com/in/username" />
        <Field label="Website" value={data.links.website ?? ""} onChange={(v) => setLink("website", v)} placeholder="https://yoursite.com" />
      </Section>

      <Section title="Skills">
        <TagInput values={data.skills} onChange={(v) => set("skills", v)} placeholder="Type a skill and press Enter" />
      </Section>

      <Section title={`Projects (${projects.list.length})`}>
        {projects.list.map((p, i) => (
          <ItemCard
            key={i}
            title={p.title || `Project ${i + 1}`}
            onRemove={() => projects.remove(i)}
            onMoveUp={i > 0 ? () => projects.moveUp(i) : undefined}
          >
            <Field label="Title" value={p.title} onChange={(v) => projects.edit(i, { title: v })} />
            <TextArea label="Description" rows={3} value={p.description} onChange={(v) => projects.edit(i, { description: v })} />
            <Field label="Live link" value={p.url ?? ""} onChange={(v) => projects.edit(i, { url: v })} placeholder="https://" />
            <Field label="Code link" value={p.repoUrl ?? ""} onChange={(v) => projects.edit(i, { repoUrl: v })} placeholder="https://github.com/…" />
            <TagInput label="Tech" values={p.tech} onChange={(v) => projects.edit(i, { tech: v })} placeholder="React, Node.js…" />
          </ItemCard>
        ))}
        <AddButton onClick={projects.add}>+ Add project</AddButton>
      </Section>

      <Section title={`Experience (${jobs.list.length})`}>
        {jobs.list.map((e, i) => (
          <ItemCard
            key={i}
            title={e.role || e.company || `Role ${i + 1}`}
            onRemove={() => jobs.remove(i)}
            onMoveUp={i > 0 ? () => jobs.moveUp(i) : undefined}
          >
            <Field label="Role" value={e.role} onChange={(v) => jobs.edit(i, { role: v })} />
            <Field label="Company" value={e.company} onChange={(v) => jobs.edit(i, { company: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" value={e.start} onChange={(v) => jobs.edit(i, { start: v })} placeholder="2022" />
              <Field label="End" value={e.end ?? ""} onChange={(v) => jobs.edit(i, { end: v })} placeholder="Present" />
            </div>
            <TextArea label="What you did" rows={3} value={e.summary} onChange={(v) => jobs.edit(i, { summary: v })} />
          </ItemCard>
        ))}
        <AddButton onClick={jobs.add}>+ Add role</AddButton>
      </Section>

      <Section title={`Education (${schools.list.length})`}>
        {schools.list.map((s, i) => (
          <ItemCard
            key={i}
            title={s.school || `School ${i + 1}`}
            onRemove={() => schools.remove(i)}
            onMoveUp={i > 0 ? () => schools.moveUp(i) : undefined}
          >
            <Field label="School" value={s.school} onChange={(v) => schools.edit(i, { school: v })} />
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <Field label="Degree" value={s.degree} onChange={(v) => schools.edit(i, { degree: v })} />
              <Field label="Year" value={s.year ?? ""} onChange={(v) => schools.edit(i, { year: v })} />
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={schools.add}>+ Add education</AddButton>
      </Section>
    </>
  )

  // ---------- Style tab ----------
  const accent = theme.accent ?? meta?.accent ?? "#ffffff"
  const stylePanel = (
    <>
      <Section title="Template">
        <div className="grid grid-cols-2 gap-2">
          {templateMeta.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => updateTemplate(t.id)}
              className={`rounded-xl border p-3 text-left transition-all ${
                templateId === t.id ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"
              }`}
            >
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-neutral-500">{t.category}</p>
            </button>
          ))}
        </div>
      </Section>

      <FontPicker title="Heading font" value={theme.headingFont} onChange={(v) => updateTheme({ ...theme, headingFont: v })} />
      <FontPicker title="Body font" value={theme.bodyFont} onChange={(v) => updateTheme({ ...theme, bodyFont: v })} />

      <Section title="Accent color">
        {meta?.accent ? (
          <>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateTheme({ ...theme, accent: c })}
                  aria-label={`Use ${c}`}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    accent.toLowerCase() === c.toLowerCase() ? "border-white" : "border-white/10"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={accent}
                onChange={(e) => updateTheme({ ...theme, accent: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
              />
              <span className="font-mono text-xs text-neutral-400">{accent.toUpperCase()}</span>
              {theme.accent && (
                <button
                  type="button"
                  onClick={() => updateTheme({ ...theme, accent: undefined })}
                  className="ml-auto text-xs text-neutral-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">{meta?.name ?? "This template"} is black and white, so it doesn&apos;t use an accent color.</p>
        )}
      </Section>

      <div className="px-5 py-6">
        <button type="button" onClick={() => updateTheme({})} className="text-sm text-neutral-400 hover:text-white">
          Reset fonts and colors to template defaults
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="nav-glow shrink-0 text-sm" data-text="← Dashboard">← Dashboard</Link>
          <SaveBadge state={saveState} onRetry={flush} />
        </div>

        <div className="hidden items-center rounded-full border border-white/10 p-1 lg:flex">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={`rounded-full px-4 py-1.5 text-xs capitalize transition-all ${
                device === d ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {published && liveSlug && (
            <a
              href={`/p/${liveSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:border-white/40 sm:block"
            >
              View live ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
          >
            {published ? "Published ✓" : "Publish"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <aside
          className={`${mobileView === "edit" ? "flex" : "hidden"} w-full flex-col border-r border-white/10 lg:flex lg:w-[400px] lg:shrink-0`}
        >
          <div className="flex shrink-0 border-b border-white/10">
             {(["content", "sections", "style"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm capitalize transition-colors ${
                  tab === t ? "border-b-2 border-white text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
                   <div className="flex-1 overflow-y-auto">
            {tab === "content" ? (
              contentPanel
            ) : tab === "sections" ? (
              <SectionsPanel data={data} theme={theme} onChange={updateTheme} />
            ) : (
              stylePanel
            )}
          </div>
        </aside>

        <div className={`${mobileView === "preview" ? "block" : "hidden"} relative min-w-0 flex-1 bg-[#0c0c0c] lg:block`}>
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative h-full">
            <LivePreview device={device}>
              <RenderPortfolio templateId={templateId} data={data} theme={theme} />
            </LivePreview>
          </div>
        </div>
      </div>

      {/* Phone: switch between editing and preview */}
      <div className="flex shrink-0 border-t border-white/10 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMobileView(v)}
            className={`flex-1 py-3 text-sm capitalize ${mobileView === v ? "bg-white/10 text-white" : "text-neutral-500"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {publishOpen && (
        <PublishDialog
          initialSlug={liveSlug ?? suggestedSlug}
          published={published}
          liveSlug={liveSlug}
          onClose={() => setPublishOpen(false)}
          onFlush={flush}
          onPublished={(slug) => {
            setPublished(true)
            setLiveSlug(slug)
          }}
          onUnpublished={() => setPublished(false)}
        />
      )}
    </div>
  )
}

function SaveBadge({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === "error") {
    return (
      <button type="button" onClick={onRetry} className="truncate text-xs text-red-400 hover:underline">
        Couldn&apos;t save. Retry
      </button>
    )
  }
  const text = { saved: "All changes saved", unsaved: "Unsaved changes…", saving: "Saving…" }[state]
  return <span className="truncate text-xs text-neutral-500">{text}</span>
}

function FontPicker({ title, value, onChange }: { title: string; value?: FontId; onChange: (v?: FontId) => void }) {
  return (
    <Section title={title}>
      <div className="grid grid-cols-3 gap-2">
        <FontButton active={!value} onClick={() => onChange(undefined)} label="Template" />
        {FONT_OPTIONS.map((f) => (
          <FontButton key={f.id} active={value === f.id} onClick={() => onChange(f.id)} label={f.label} family={fontFamilies[f.id]} />
        ))}
      </div>
    </Section>
  )
}

function FontButton({ active, onClick, label, family }: { active: boolean; onClick: () => void; label: string; family?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-2 py-3 text-center transition-all ${
        active ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"
      }`}
    >
      <span className="block text-xl leading-none" style={{ fontFamily: family }}>Aa</span>
      <span className="mt-1.5 block truncate text-[11px] text-neutral-400">{label}</span>
    </button>
  )
}

function PublishDialog({
  initialSlug,
  published,
  liveSlug,
  onClose,
  onFlush,
  onPublished,
  onUnpublished,
}: {
  initialSlug: string
  published: boolean
  liveSlug: string | null
  onClose: () => void
  onFlush: () => Promise<boolean>
  onPublished: (slug: string) => void
  onUnpublished: () => void
}) {
  const [slug, setSlug] = useState(initialSlug)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [origin] = useState(() => window.location.origin)

  const problem = slugError(slug)
  const isLive = published && liveSlug
  const liveUrl = `${origin}/p/${liveSlug}`

  async function publish() {
    setBusy(true)
    setError("")
    const saved = await onFlush() // save latest edits first
    if (!saved) {
      setBusy(false)
      setError("Couldn't save your latest changes. Try again.")
      return
    }
    const res = await fetch("/api/portfolio/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, publish: true }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(json.error || "Couldn't publish. Try again.")
    onPublished(json.slug)
  }

  async function unpublish() {
    setBusy(true)
    setError("")
    const res = await fetch("/api/portfolio/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: false }),
    })
    setBusy(false)
    if (res.ok) onUnpublished()
    else setError("Couldn't unpublish. Try again.")
  }

  async function copy() {
    await navigator.clipboard.writeText(liveUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#161616] p-7">
        <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">{isLive ? "// YOU'RE LIVE" : "// PUBLISH"}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {isLive ? "Your portfolio is live" : "Put your portfolio online"}
        </h2>

        {isLive && (
          <>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 pl-4">
              <span className="min-w-0 flex-1 truncate font-mono text-sm">{liveUrl}</span>
              <button type="button" onClick={copy} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-full bg-white py-3 text-center text-sm font-medium text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
            >
              Open my site ↗
            </a>
            <p className="mt-4 text-sm text-neutral-400">Your edits are saved automatically and show up on your live site right away.</p>
          </>
        )}

        <div className="mt-6">
          <span className="mb-1.5 block text-xs text-neutral-400">{isLive ? "Change your link" : "Choose your link"}</span>
          <div className="flex items-center rounded-xl border border-white/15 bg-white/[0.03] pl-3.5 focus-within:border-white/50">
            <span className="shrink-0 font-mono text-xs text-neutral-500">{origin.replace(/^https?:\/\//, "")}/p/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 font-mono text-sm text-white outline-none"
              placeholder="your-name"
            />
          </div>
          {slug && problem && <p className="mt-2 text-xs text-amber-300">{problem}</p>}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex items-center gap-3">
          {(!isLive || slug !== liveSlug) && (
            <button
              type="button"
              onClick={publish}
              disabled={busy || !!problem}
              className={`flex-1 rounded-full py-3 text-sm font-medium transition-all disabled:opacity-50 ${
                isLive ? "border border-white/25 hover:bg-white hover:text-black" : "bg-white text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
              }`}
            >
              {busy ? "Working…" : isLive ? "Update link" : "Publish now"}
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm text-neutral-400 hover:text-white">
            Close
          </button>
        </div>

        {isLive && (
          <button type="button" onClick={unpublish} disabled={busy} className="mt-4 text-xs text-neutral-500 hover:text-red-400">
            Unpublish (take my site offline)
          </button>
        )}
      </div>
    </div>
  )
}