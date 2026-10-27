"use client"

import Link from "next/link"
import { useState } from "react"

const links = [
  { href: "/help", label: "Help" },
  { href: "/templates", label: "Templates" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Log in" },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fade-down absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-end px-6 py-6 md:justify-center">
        <div className="hidden items-center gap-14 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-text={l.label} className="nav-glow text-[15px] tracking-wide">
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-white md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="mx-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#1a1a1a]/95 p-3 backdrop-blur md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-text={l.label}
              onClick={() => setOpen(false)}
              className="nav-glow rounded-lg px-3 py-2.5 text-[15px]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}