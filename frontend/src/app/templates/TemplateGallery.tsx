"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import RenderPortfolio from "@/components/templates/RenderPortfolio"
import { templateMeta } from "@/components/templates/meta"
import { SAMPLE_PORTFOLIO } from "./sample"

const EDITOR_PATH = "/editor"
const PREVIEW_WIDTH = 1280 // render templates at desktop width, then scale down

export default function TemplateGallery({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2">
      {templateMeta.map((t) => {
        const editorUrl = `${EDITOR_PATH}?template=${t.id}`
        const href = loggedIn ? editorUrl : `/login?next=${encodeURIComponent(editorUrl)}`

        return (
          <article key={t.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            <ScaledPreview templateId={t.id} />
            <div className="flex items-center justify-between gap-4 border-t border-white/10 p-5">
              <div>
                <h2 className="font-medium">{t.name}</h2>
                <p className="text-xs text-neutral-500">{t.category}</p>
              </div>
              <Link
                href={href}
                className="shrink-0 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
              >
                {loggedIn ? "Use template" : "Get started"}
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ScaledPreview({ templateId }: { templateId: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  // Keep the preview scaled to fit the card at any screen width
  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PREVIEW_WIDTH))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={box} aria-hidden className="relative aspect-[16/10] overflow-hidden bg-[#0c0c0c]">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left select-none"
        style={{ width: PREVIEW_WIDTH, transform: `scale(${scale})` }}
      >
        <RenderPortfolio templateId={templateId} data={SAMPLE_PORTFOLIO} theme={{}} />
      </div>
    </div>
  )
}