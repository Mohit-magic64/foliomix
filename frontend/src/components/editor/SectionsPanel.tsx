"use client"

import { useState } from "react"
import {
  SECTION_LABELS,
  resolveSections,
  type Portfolio,
  type SectionId,
  type SectionSetting,
  type Theme,
} from "@/lib/portfolio"

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

// Short hint under each section name, so users know what's in it
const summary: Record<SectionId, (d: Portfolio) => string> = {
  about: (d) => (d.about ? "Filled in" : "Empty — add it in Content"),
  projects: (d) => plural(d.projects.length, "project"),
  skills: (d) => plural(d.skills.length, "skill"),
  experience: (d) => plural(d.experience.length, "role"),
  education: (d) => plural(d.education.length, "entry", "entries"),
  contact: (d) => d.links.email || "Add your email in Content",
}

export default function SectionsPanel({
  data,
  theme,
  onChange,
}: {
  data: Portfolio
  theme: Theme
  onChange: (next: Theme) => void
}) {
  const list = resolveSections(theme.sections)
  const [dragId, setDragId] = useState<SectionId | null>(null)

  const save = (next: SectionSetting[]) => onChange({ ...theme, sections: next })

  function move(from: number, to: number) {
    if (to < 0 || to >= list.length || from === to) return
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    save(next)
  }

  const toggle = (id: SectionId) =>
    save(list.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))

  const arrowBtn =
    "flex h-7 w-7 items-center justify-center rounded-lg text-sm text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"

  return (
    <div className="px-5 py-6">
      <h3 className="font-mono text-[11px] tracking-[0.2em] text-neutral-500">{"// PAGE SECTIONS"}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        Drag to reorder, or use the arrows. Hidden sections keep their content, so you can bring them back anytime.
        Your name and headline always stay at the top.
      </p>

      <ul className="mt-5 space-y-2">
        {list.map((s, i) => {
          const label = SECTION_LABELS[s.id]
          return (
            <li
              key={s.id}
              draggable
              onDragStart={(e) => {
                setDragId(s.id)
                e.dataTransfer.effectAllowed = "move"
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (!dragId || dragId === s.id) return
                move(list.findIndex((x) => x.id === dragId), i)
              }}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={() => setDragId(null)}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors ${
                dragId === s.id ? "border-white/50 bg-white/10" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <span className="cursor-grab select-none text-lg text-neutral-500 active:cursor-grabbing" aria-hidden>⠿</span>

              <div className={`min-w-0 flex-1 ${s.visible ? "" : "opacity-40"}`}>
                <p className="text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-neutral-500">{s.visible ? summary[s.id](data) : "Hidden"}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${label} up`} className={arrowBtn}>↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} aria-label={`Move ${label} down`} className={arrowBtn}>↓</button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.visible}
                  aria-label={`Show ${label}`}
                  onClick={() => toggle(s.id)}
                  className={`relative ml-1 h-6 w-10 rounded-full transition-colors ${s.visible ? "bg-white" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full transition-all ${s.visible ? "left-5 bg-black" : "left-1 bg-white/60"}`}
                  />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => onChange({ ...theme, sections: undefined })}
        className="mt-5 text-sm text-neutral-400 hover:text-white"
      >
        Reset to default order
      </button>
    </div>
  )
}