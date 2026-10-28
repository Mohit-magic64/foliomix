import Link from "next/link"
import Header from "@/components/landing/Header"

const stats = [
  { value: "Minutes", label: "not weekends, to go live" },
  { value: "2 ways", label: "to start: GitHub or resume" },
  { value: "1 click", label: "to publish your site" },
  { value: "0 code", label: "required, ever" },
]

const steps = [
  { n: "01", title: "Sign in", body: "Create your account with Google or just your email. No passwords to remember." },
  { n: "02", title: "Bring your story", body: "Connect GitHub to pull in your projects, or upload your resume and let AI organize it." },
  { n: "03", title: "Make it yours", body: "Pick a trending template, then tweak fonts, colors, and every line of text." },
  { n: "04", title: "Go live", body: "One click and your portfolio is online, with a link you can share anywhere." },
]

const audience = [
  { title: "Students", body: "Turn coursework, hackathons, and side projects into something recruiters actually browse." },
  { title: "Developers", body: "Your repos already tell the story. Foliomix gives them a stage." },
  { title: "Designers & creators", body: "Clean, modern layouts that let your work speak first." },
  { title: "Job seekers", body: "Go from a resume PDF to a personal website before your next application." },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <Header animate={false} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-40 text-center">
        <div className="dot-grid dot-grid-fade absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl">
          <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// ABOUT FOLIOMIX</p>
          <h1 className="text-fade mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Your work deserves
            <br />
            a better home.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Foliomix turns your GitHub profile or resume into a polished portfolio website
            in minutes. No design skills, no code, no hosting headaches.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.value} className="bg-[#111111] p-8">
              <p className="text-2xl font-semibold md:text-3xl">{s.value}</p>
              <p className="mt-2 text-sm text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// WHY WE BUILT THIS</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Building a portfolio shouldn&apos;t take a weekend.
            </h2>
          </div>
          <div className="space-y-5 leading-relaxed text-neutral-400">
            <p>
              Most people put off making a portfolio because it means wrestling with website
              builders, picking hosting, and rewriting everything they&apos;ve already written in
              their resume.
            </p>
            <p>
              We think your experience should do the work. Foliomix reads what you&apos;ve already
              built, your repos and your resume, and shapes it into a site that looks like
              you spent days on it.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// HOW IT WORKS</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Four steps. That&apos;s it.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="card-glow rounded-2xl border border-dashed border-white/15 p-6">
                <p className="font-mono text-sm text-neutral-500">{s.n}</p>
                <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">// WHO IT&apos;S FOR</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Made for people with work to show.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {audience.map((a) => (
              <div key={a.title} className="card-glow rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                <h3 className="text-xl font-medium">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-400">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-dashed border-white/20 px-6 py-20 text-center">
          <div className="dot-grid dot-grid-fade absolute inset-0" aria-hidden />
          <div className="relative">
            <h2 className="text-fade text-4xl font-semibold tracking-tight md:text-5xl">Ready to go live?</h2>
            <p className="mt-4 text-neutral-400">Your portfolio is a few minutes away.</p>
            <Link
              href="/login"
              className="group relative mt-10 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3.5 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] active:scale-95"
            >
              <span className="shine" aria-hidden />
              <span className="relative">Get Started</span>
              <svg className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row">
          <p>© 2026 Foliomix</p>
          <div className="flex gap-8">
            <Link href="/" className="nav-glow" data-text="Home">Home</Link>
            <Link href="/help" className="nav-glow" data-text="Help">Help</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}