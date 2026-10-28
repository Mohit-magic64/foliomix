import { NextResponse } from "next/server"
import { getSessionAndPortfolio, savePortfolio } from "@/lib/portfolio-db"
import { isEmpty, slugError, slugify } from "@/lib/portfolio"

export async function POST(request: Request) {
  const { supabase, user, row } = await getSessionAndPortfolio()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))

  // Unpublish
  if (body.publish === false) {
    try {
      await savePortfolio(supabase, user.id, { published: false })
      return NextResponse.json({ ok: true, published: false })
    } catch (err) {
      console.error("Unpublish failed:", err)
      return NextResponse.json({ error: "Couldn't unpublish." }, { status: 500 })
    }
  }

  // Publish
  const slug = slugify(String(body.slug ?? ""))
  const problem = slugError(slug)
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })

  if (!row || isEmpty(row.data)) {
    return NextResponse.json({ error: "Add your details before publishing." }, { status: 400 })
  }

  try {
    await savePortfolio(supabase, user.id, {
      slug,
      published: true,
      template_id: row.template_id ?? "mono",
    })
    return NextResponse.json({ ok: true, slug })
  } catch (err) {
    // 23505 = this slug already belongs to someone else
    if ((err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "That link is taken. Try another." }, { status: 409 })
    }
    console.error("Publish failed:", err)
    return NextResponse.json({ error: "Couldn't publish. Try again." }, { status: 500 })
  }
}