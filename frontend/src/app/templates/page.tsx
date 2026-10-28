import { createClient } from "@/lib/supabase/server"
import TemplateGallery from "./TemplateGallery"

export const metadata = { title: "Templates · Foliomix" }

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// TEMPLATES</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Pick a look. Change it anytime.</h1>
      <p className="mt-3 max-w-xl text-neutral-400">
        Every template uses the same content, so you can switch later without losing anything.
      </p>
      <TemplateGallery loggedIn={!!user} />
    </main>
  )
}