"use client"

import { useState, type ReactNode } from "react"

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors focus:border-white/40"

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs text-neutral-400">{children}</span>
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y leading-relaxed`}
      />
    </label>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-white/10 px-5 py-6">
      <h3 className="mb-4 font-mono text-[11px] tracking-[0.2em] text-neutral-500">{"// " + title.toUpperCase()}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

// Type a tag and press Enter or comma to add it
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label?: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")

  function add() {
    const v = draft.trim()
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v])
    setDraft("")
  }

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors focus-within:border-white/40">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1.5 text-xs">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:bg-white/20 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={values.length === 0 ? placeholder : "Add more…"}
          onChange={(e) => setDraft(e.target.value.replace(",", ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              add()
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1))
            }
          }}
          onBlur={add}
          className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-sm text-white placeholder:text-neutral-600 outline-none"
        />
      </div>
    </div>
  )
}

export function ItemCard({
  title,
  onRemove,
  onMoveUp,
  children,
}: {
  title: string
  onRemove: () => void
  onMoveUp?: () => void
  children: ReactNode
}) {
  const btn = "flex h-7 w-7 items-center justify-center rounded-lg text-sm text-neutral-400 hover:bg-white/10 hover:text-white"
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{title}</span>
        <div className="flex shrink-0 gap-1">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} aria-label="Move up" className={btn}>↑</button>
          )}
          <button type="button" onClick={onRemove} aria-label="Remove" className={`${btn} hover:text-red-400`}>✕</button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-neutral-400 transition-colors hover:border-white/40 hover:text-white"
    >
      {children}
    </button>
  )
}