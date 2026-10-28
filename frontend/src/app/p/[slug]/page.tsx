import { Suspense, cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { normalize, normalizeTheme } from "@/lib/portfolio"
import RenderPortfolio from "@/components/templates/RenderPortfolio"

type Props = { params: Promise<{ slug: string }> }

// cache() means the page and its title share one database lookup
const getPublished = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("portfolios")
    .select("data, template_id, theme")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (!data) return null
  return {
    data: normalize(data.data),
    templateId: (data.template_id as string | null) ?? null,
    theme: normalizeTheme(data.theme),
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getPublished(slug)
  if (!p) return { title: "Portfolio not found" }
  return {
    title: `${p.data.name || slug} — Portfolio`,
    description: p.data.headline || p.data.about.slice(0, 150),
  }
}

async function PublishedPortfolio({ params }: Props) {
  const { slug } = await params
  const p = await getPublished(slug)
  if (!p) notFound()
  return <RenderPortfolio templateId={p.templateId} data={p.data} theme={p.theme} />
}

export default function PublicPortfolioPage({ params }: Props) {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <PublishedPortfolio params={params} />
      </Suspense>
      <Link
        href="/"
        className="fixed bottom-4 right-4 z-50 rounded-full border border-white/15 bg-black/80 px-4 py-2 text-xs text-white backdrop-blur transition-colors hover:bg-black"
      >
        Made with Foliomix
      </Link>
    </>
  )
}