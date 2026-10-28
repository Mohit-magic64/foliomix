import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSessionAndPortfolio } from "@/lib/portfolio-db"
import { emptyPortfolio, isEmpty, samplePortfolio, type Portfolio } from "@/lib/portfolio"
import ImportPanel from "@/components/dashboard/ImportPanel"
import TemplateGallery from "@/components/dashboard/TemplateGallery"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// STEP {step}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-2 text-neutral-400">{subtitle}</p>
    </div>
  )
}

function ProfileSummary({ data }: { data: Portfolio }) {
  if (isEmpty(data)) return null
  const initials =
    data.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  const counts = [
    { n: data.projects.length, label: "projects" },
    { n: data.skills.length, label: "skills" },
    { n: data.experience.length, label: "roles" },
    { n: data.education.length, label: "education" },
  ].filter((c) => c.n > 0)

  return (
    <div className="mt-4 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:flex-row md:items-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg font-medium">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// YOUR PROFILE</p>
        <p className="mt-1 text-lg font-medium">{data.name || "Unnamed"}</p>
        {data.headline && <p className="truncate text-sm text-neutral-400">{data.headline}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {counts.map((c) => (
          <span key={c.label} className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
            {c.n} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

async function Dashboard() {
  const { user, row } = await getSessionAndPortfolio()
  if (!user) redirect("/login")

  const data = row?.data ?? emptyPortfolio
  const sources = row?.sources ?? {}
  const imported = !isEmpty(data)
  const fullName: string = data.name || user.user_metadata?.full_name || ""
  const firstName = fullName.split(" ")[0] || "there"

  const steps = [
    { label: "Import details", done: imported },
    { label: "Pick a template", done: Boolean(row?.template_id) },
    { label: "Customize", done: false },
    { label: "Publish", done: false },
  ]

  return (
    <>
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">Foliomix</Link>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden text-neutral-500 sm:inline">{user.email}</span>
          <form action={signOut}>
            <button className="nav-glow" data-text="Sign out">Sign out</button>
          </form>
        </div>
      </nav>

      <section className="relative mx-auto max-w-6xl px-6 pb-14 pt-10">
        <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// YOUR PORTFOLIO BUILDER</p>
        <h1 className="text-fade mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Hey {firstName}, let&apos;s build your site.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-400">
          Bring in your details, pick a look, and you&apos;re minutes away from going live.
        </p>
        <ol className="mt-10 flex flex-wrap gap-3">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                s.done ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-neutral-500"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  s.done ? "bg-white text-black" : "border border-white/20"
                }`}
              >
                {s.done ? "✓" : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <SectionTitle
          step="01"
          title="Import your details"
          subtitle="Use one or all three. Everything is combined into one profile."
        />
        <ImportPanel sources={sources} />
        <ProfileSummary data={data} />
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle
          step="02"
          title="Pick a template"
          subtitle={
            imported
              ? "Previews show your real details. Hover a preview to scroll through it."
              : "Previews use sample content until you import your details. Hover to scroll."
          }
        />
        <TemplateGallery data={imported ? data : samplePortfolio} selectedId={row?.template_id ?? null} />
      </section>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28">
      <div className="h-12 w-2/3 animate-pulse rounded-xl bg-white/10" />
      <div className="mt-4 h-5 w-1/3 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-16 grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111111] text-white">
      <div className="dot-grid dot-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[600px]" aria-hidden />
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}