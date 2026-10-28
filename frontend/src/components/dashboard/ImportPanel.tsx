"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { Sources } from "@/lib/portfolio"

type Kind = "resume" | "linkedin" | "github"
type Status = { state: "idle" | "working" | "error"; message?: string }

const idle: Status = { state: "idle" }

export default function ImportPanel({ sources }: { sources: Sources }) {
  const router = useRouter()
  const [status, setStatus] = useState<Record<Kind, Status>>({ resume: idle, linkedin: idle, github: idle })
  const [username, setUsername] = useState("")

  const update = (k: Kind, s: Status) => setStatus((prev) => ({ ...prev, [k]: s }))

  async function send(kind: Kind, url: string, init: RequestInit) {
    update(kind, { state: "working" })
    try {
      const res = await fetch(url, init)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.")
      update(kind, idle)
      router.refresh() // reload the page data so previews update
    } catch (err) {
      update(kind, { state: "error", message: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  function uploadPdf(kind: "resume" | "linkedin", file?: File) {
    if (!file) return
    if (file.type !== "application/pdf") return update(kind, { state: "error", message: "Please choose a PDF file." })
    if (file.size > 4 * 1024 * 1024) return update(kind, { state: "error", message: "That file is over 5 MB." })
    const body = new FormData()
    body.append("file", file)
    body.append("source", kind)
    send(kind, "/api/import/resume", { method: "POST", body })
  }

  function importGithub(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    send("github", "/api/import/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ImportCard
        icon={<DocIcon />}
        title="Upload resume"
        description="Drop your resume PDF and AI fills in your experience, skills, and projects."
        done={sources.resume}
        status={status.resume}
      >
        <PdfDrop
          onFile={(f) => uploadPdf("resume", f)}
          working={status.resume.state === "working"}
          workingLabel="Reading your resume… about 20 seconds"
        />
      </ImportCard>

      <ImportCard
        icon={<ProfileIcon />}
        title="Import from LinkedIn"
        description="On your LinkedIn profile, click More (or Resources) → Save to PDF, then upload that file here."
        done={sources.linkedin}
        status={status.linkedin}
      >
        <PdfDrop
          onFile={(f) => uploadPdf("linkedin", f)}
          working={status.linkedin.state === "working"}
          workingLabel="Reading your profile… about 20 seconds"
        />
      </ImportCard>

      <ImportCard
        icon={<CodeIcon />}
        title="Connect GitHub"
        description="Enter your username and we'll pull in your top public repositories and languages."
        done={sources.github}
        status={status.github}
      >
        <form onSubmit={importGithub} className="flex h-24 flex-col justify-end gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github username"
            className="h-11 rounded-full border border-white/15 bg-transparent px-4 text-sm text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/60"
          />
          <button
            type="submit"
            disabled={status.github.state === "working" || !username.trim()}
            className="h-11 rounded-full bg-white text-sm font-medium text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] disabled:opacity-50"
          >
            {status.github.state === "working" ? "Importing…" : "Import repos"}
          </button>
        </form>
      </ImportCard>
    </div>
  )
}

function ImportCard({
  icon,
  title,
  description,
  done,
  status,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  done?: string
  status: Status
  children: React.ReactNode
}) {
  return (
    <div className="card-glow flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white">{icon}</div>
        {done && (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            ✓ Imported
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-medium">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">{description}</p>
      {done && <p className="mt-3 truncate font-mono text-xs text-neutral-500">{done}</p>}
      <div className="mt-5">{children}</div>
      {status.state === "error" && <p className="mt-3 text-sm text-red-400">{status.message}</p>}
    </div>
  )
}

function PdfDrop({
  onFile,
  working,
  workingLabel,
}: {
  onFile: (f?: File) => void
  working: boolean
  workingLabel: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <div>
      <button
        type="button"
        disabled={working}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          onFile(e.dataTransfer.files[0])
        }}
        className={`flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-sm transition-all disabled:cursor-wait ${
          over ? "border-white bg-white/10" : "border-white/20 hover:border-white/50 hover:bg-white/5"
        }`}
      >
        {working ? (
          <span className="animate-pulse px-4 text-center text-neutral-300">{workingLabel}</span>
        ) : (
          <>
            <span className="text-white">Choose a PDF</span>
            <span className="text-xs text-neutral-500">or drag it here · max 5 MB</span>
          </>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </div>
  )
}

function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2.5" />
      <path d="M5.5 17c.8-1.8 2-2.7 3.5-2.7s2.7.9 3.5 2.7M15 10h3M15 14h3" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
    </svg>
  )
}