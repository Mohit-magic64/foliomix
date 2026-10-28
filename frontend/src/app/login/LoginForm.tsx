"use client"

import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm({ hadError }: { hadError: boolean }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(hadError ? "Sign-in didn't work. Please try again." : "")

  async function handleGoogle() {
    setError("")
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStatus("sending")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setStatus("idle")
    } else {
      setStatus("sent")
    }
  }

  if (status === "sent") {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>
        <h2 className="mt-5 text-lg font-medium">Check your inbox</h2>
        <p className="mt-2 text-sm text-neutral-400">
          We sent a login link to <span className="text-white">{email}</span>.
          Open it in this same browser.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="nav-glow mt-6 text-sm"
          data-text="Use a different email"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex h-12 items-center justify-center gap-3 rounded-full bg-white font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-60"
      >
        <Image src="/google.svg" alt="" width={18} height={18} />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmail} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 rounded-full border border-white/15 bg-transparent px-5 text-white placeholder:text-neutral-500 outline-none transition-all focus:border-white/60 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-12 rounded-full border border-white/25 font-medium text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black disabled:opacity-60"
        >
          {status === "sending" ? "Sending link…" : "Continue with email"}
        </button>
      </form>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  )
}