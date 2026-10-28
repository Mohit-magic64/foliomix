import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSessionAndPortfolio } from "@/lib/portfolio-db"
import { emptyPortfolio, slugify } from "@/lib/portfolio"
import Editor from "@/components/editor/Editor"

async function EditorLoader() {
  const { user, row } = await getSessionAndPortfolio()
  if (!user) redirect("/login")

  const suggestedSlug = slugify(row?.data.name || user.email?.split("@")[0] || "")

  return (
    <Editor
      initial={{
        data: row?.data ?? emptyPortfolio,
        theme: row?.theme ?? {},
        templateId: row?.template_id ?? "mono",
        slug: row?.slug ?? null,
        published: row?.published ?? false,
      }}
      suggestedSlug={suggestedSlug}
    />
  )
}

function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-14 border-b border-white/10" />
      <div className="flex flex-1">
        <div className="w-[400px] space-y-4 border-r border-white/10 p-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="flex-1 animate-pulse bg-white/[0.02]" />
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <main className="h-screen overflow-hidden bg-[#111111] text-white">
      <Suspense fallback={<EditorSkeleton />}>
        <EditorLoader />
      </Suspense>
    </main>
  )
}