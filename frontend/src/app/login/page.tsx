import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LoginForm from "./LoginForm"

type Props = { searchParams: Promise<{ error?: string }> }

// This part reads cookies, so it runs inside <Suspense>
async function LoginGate({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect("/dashboard")
  const { error } = await searchParams
  return <LoginForm hadError={Boolean(error)} />
}

// Loading placeholder shown for a split second
function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-12 animate-pulse rounded-full bg-white/10" />
      <div className="h-4" />
      <div className="h-12 animate-pulse rounded-full bg-white/5" />
      <div className="h-12 animate-pulse rounded-full bg-white/5" />
    </div>
  )
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111111] px-6 text-white">
      <div className="dot-grid dot-grid-fade absolute inset-0" aria-hidden />

      <Link href="/" className="nav-glow absolute left-6 top-6 text-sm" data-text="← Back">
        ← Back
      </Link>

      <div className="relative w-full max-w-sm">
        <p className="text-center font-mono text-xs tracking-[0.2em] text-neutral-500">// SIGN IN</p>
        <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight">Welcome to Foliomix</h1>
        <p className="mt-3 text-center text-neutral-400">
          Sign in to build your portfolio in minutes.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#161616]/80 p-6 backdrop-blur">
          <Suspense fallback={<FormSkeleton />}>
            <LoginGate searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  )
}