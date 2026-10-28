"use client"

import { useState } from "react"
import { categories, templateMeta, type Category } from "@/components/templates/meta"
import { templateComponents } from "@/components/templates/registry"
import TemplatePreview from "./TemplatePreview"
import type { Portfolio } from "@/lib/portfolio"

export default function TemplateGallery({ data, selectedId }: { data: Portfolio; selectedId: string | null }) {
  const [filter, setFilter] = useState<Category>("All")
  const [selected, setSelected] = useState(selectedId)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState("")

  const list = filter === "All" ? templateMeta : templateMeta.filter((t) => t.category === filter)

  async function choose(id: string) {
    setSaving(id)
    setError("")
    const res = await fetch("/api/portfolio/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: id }),
    })
    setSaving(null)
    if (res.ok) setSelected(id)
    else setError("Couldn't save your choice. Please try again.")
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              filter === c
                ? "border-white bg-white text-black"
                : "border-white/15 text-neutral-400 hover:border-white/40 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {list.map((t) => {
          const Template = templateComponents[t.id]
          const isSelected = selected === t.id
          return (
            <article
              key={t.id}
              className={`overflow-hidden rounded-3xl border bg-white/[0.02] transition-all duration-300 ${
                isSelected
                  ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.12)]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="relative border-b border-white/10">
                <TemplatePreview>
                  <Template data={data} />
                </TemplatePreview>
                {t.badge && (
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
                    {t.badge === "Trending" ? "● Trending" : "✦ New"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{t.name}</h3>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-neutral-400">{t.category}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{t.description}</p>
                  <p className="mt-3 font-mono text-xs text-neutral-500">Fonts: {t.fonts}</p>
                </div>
                <button
                  onClick={() => choose(t.id)}
                  disabled={saving !== null}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-60 ${
                    isSelected
                      ? "bg-white text-black"
                      : "border border-white/25 text-white hover:border-white hover:bg-white hover:text-black"
                  }`}
                >
                  {isSelected ? "Selected ✓" : saving === t.id ? "Saving…" : "Use template"}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}