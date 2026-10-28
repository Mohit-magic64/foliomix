import { NextResponse } from "next/server"
import { getSessionAndPortfolio, savePortfolio } from "@/lib/portfolio-db"
import { templateMeta } from "@/components/templates/meta"

export async function POST(request: Request) {
  const { supabase, user } = await getSessionAndPortfolio()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const templateId = String(body.templateId ?? "")
  if (!templateMeta.some((t) => t.id === templateId)) {
    return NextResponse.json({ error: "Unknown template." }, { status: 400 })
  }

  try {
    await savePortfolio(supabase, user.id, { template_id: templateId })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Saving failed:", err)
    return NextResponse.json({ error: "Couldn't save your choice." }, { status: 500 })
  }
}