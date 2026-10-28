"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

const WIDTH = 1280

export default function TemplatePreview({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  const [maxShift, setMaxShift] = useState(0)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const f = frame.current
    const p = page.current
    if (!f || !p) return
    const ro = new ResizeObserver(() => {
      const s = f.clientWidth / WIDTH
      setScale(s)
      setMaxShift(Math.max(0, p.scrollHeight * s - f.clientHeight))
    })
    ro.observe(f)
    ro.observe(p)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={frame}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative aspect-[16/10] w-full overflow-hidden bg-black"
    >
      <div
        ref={page}
        inert
        aria-hidden
        className="absolute left-0 top-0 origin-top-left select-none"
        style={{
          width: WIDTH,
          transform: `translateY(${hover ? -maxShift : 0}px) scale(${scale})`,
          transition: `transform ${hover ? Math.max(2, maxShift / 120) : 0.6}s ease-in-out`,
        }}
      >
        {children}
      </div>
    </div>
  )
}