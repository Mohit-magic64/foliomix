import { NextResponse } from "next/server"
import { getSessionAndPortfolio, savePortfolio } from "@/lib/portfolio-db"
import { normalize, normalizeTheme } from "@/lib/portfolio"
import { templateMeta } from "@/components/templates/meta"

export async function PATCH(request: Request) {
  const { supabase, user } = await getSessionAndPortfolio()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 })
  }

  const patch: Parameters<typeof savePortfolio>[2] = {}
  if ("data" in body) patch.data = normalize(body.data)
  if ("theme" in body) patch.theme = normalizeTheme(body.theme)
  if ("templateId" in body) {
    if (!templateMeta.some((t) => t.id === body.templateId)) {
      return NextResponse.json({ error: "Unknown template." }, { status: 400 })
    }
    patch.template_id = body.templateId
  }

  try {
    await savePortfolio(supabase, user.id, patch)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Autosave failed:", err)
    return NextResponse.json({ error: "Couldn't save." }, { status: 500 })
  }
}