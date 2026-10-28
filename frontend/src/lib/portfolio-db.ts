import { createClient } from "@/lib/supabase/server"
import { normalize, normalizeTheme, type Portfolio, type Sources, type Theme } from "@/lib/portfolio"

type Supa = Awaited<ReturnType<typeof createClient>>

export type PortfolioRow = {
  id: string
  data: Portfolio
  template_id: string | null
  theme: Theme
  slug: string | null
  sources: Sources
  published: boolean
}

export async function getSessionAndPortfolio() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, row: null }

  const { data } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const row: PortfolioRow | null = data
    ? {
        id: data.id,
        data: normalize(data.data),
        template_id: data.template_id ?? null,
        theme: normalizeTheme(data.theme),
        slug: data.slug ?? null,
        sources: (data.sources ?? {}) as Sources,
        published: Boolean(data.published),
      }
    : null

  return { supabase, user, row }
}

export async function savePortfolio(
  supabase: Supa,
  userId: string,
  patch: {
    data?: Portfolio
    template_id?: string
    theme?: Theme
    sources?: Sources
    slug?: string
    published?: boolean
  }
) {
  const { error } = await supabase
    .from("portfolios")
    .upsert(
      { user_id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
  if (error) throw error
}