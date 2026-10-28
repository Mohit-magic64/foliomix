import { NextResponse } from "next/server"
import { getSessionAndPortfolio, savePortfolio } from "@/lib/portfolio-db"
import { emptyPortfolio, mergePortfolio, normalize, withHttp } from "@/lib/portfolio"

type GhRepo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics?: string[]
  stargazers_count: number
  fork: boolean
  archived: boolean
  pushed_at: string
}

export async function POST(request: Request) {
  const { supabase, user, row } = await getSessionAndPortfolio()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const username = String(body.username ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .split("/")[0]

  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
    return NextResponse.json({ error: "That doesn't look like a GitHub username." }, { status: 400 })
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "foliomix",
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers, cache: "no-store" }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, cache: "no-store" }),
  ])

  if (userRes.status === 404) {
    return NextResponse.json({ error: "No GitHub user with that name." }, { status: 404 })
  }
  if (!userRes.ok || !reposRes.ok) {
    return NextResponse.json({ error: "GitHub is busy right now. Try again in a minute." }, { status: 502 })
  }

  const gh = await userRes.json()
  const repos: GhRepo[] = await reposRes.json()

  const original = repos.filter(
    (r) => !r.fork && !r.archived && r.name.toLowerCase() !== username.toLowerCase()
  )

  const top = [...original]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
    .slice(0, 6)

  const langCount = new Map<string, number>()
  for (const r of original) {
    if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1)
  }
  const skills = [...langCount.entries()].sort((a, b) => b[1] - a[1]).map(([lang]) => lang).slice(0, 10)

  const incoming = normalize({
    name: gh.name || gh.login,
    headline: gh.bio ?? "",
    avatarUrl: gh.avatar_url,
    location: gh.location ?? "",
    links: {
      github: gh.html_url,
      website: gh.blog ? withHttp(gh.blog) : "",
      email: gh.email ?? "",
    },
    skills,
    projects: top.map((r) => ({
      title: r.name,
      description: r.description ?? "",
      url: r.homepage ?? "",
      repoUrl: r.html_url,
      tech: [r.language, ...(r.topics ?? [])].filter(Boolean),
      stars: r.stargazers_count,
    })),
  })

  try {
    const merged = mergePortfolio(row?.data ?? emptyPortfolio, incoming)
    const sources = { ...(row?.sources ?? {}), github: `@${username}` }
    await savePortfolio(supabase, user.id, { data: merged, sources })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Saving failed:", err)
    return NextResponse.json({ error: "Couldn't save your details." }, { status: 500 })
  }
}