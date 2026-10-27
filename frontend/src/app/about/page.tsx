import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-24 text-white">
      <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Back home</Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">About Foliomix</h1>
      <p className="mt-6 leading-relaxed text-neutral-400">
        Foliomix turns your GitHub profile or resume into a polished portfolio website in minutes.
        Pick a template, tweak fonts and colors, and publish with one click. No coding or hosting setup needed.
      </p>
    </main>
  )
}