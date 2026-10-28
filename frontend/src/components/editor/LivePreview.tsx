"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export default function LivePreview({
  device,
  children,
}: {
  device: "desktop" | "mobile"
  children: ReactNode
}) {
  const width = device === "desktop" ? 1280 : 390
  const area = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const a = area.current
    const p = page.current
    if (!a || !p) return
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, (a.clientWidth - 48) / width))
      setHeight(p.scrollHeight)
    })
    ro.observe(a)
    ro.observe(p)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={area} className="h-full overflow-y-auto overflow-x-hidden p-6">
      <div
        className={`mx-auto overflow-hidden border border-white/10 shadow-2xl ${device === "mobile" ? "rounded-[2rem]" : "rounded-2xl"}`}
        style={{ width: width * scale, height: height ? height * scale : undefined }}
        // Stop links inside the preview from navigating away from the editor
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.preventDefault()
        }}
      >
        <div ref={page} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  )
}