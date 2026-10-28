import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import TemplateGallery from "./TemplateGallery"

export const metadata = { title: "Templates · Foliomix" }

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// TEMPLATES</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Pick a look. Change it anytime.</h1>
      <p className="mt-3 max-w-xl text-neutral-400">
        Every template uses the same content, so you can switch later without losing anything.
      </p>

      {/* Static gallery shows instantly; the login-aware version swaps in once cookies are read */}
      <Suspense fallback={<TemplateGallery loggedIn={false} />}>
        <GalleryForUser />
      </Suspense>
    </main>
  )
}

async function GalleryForUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return <TemplateGallery loggedIn={!!user} />
}