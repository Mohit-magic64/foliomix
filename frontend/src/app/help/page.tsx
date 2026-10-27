import { Inter } from "next/font/google"
import Link from "next/link"
import VectorWordmark from "@/components/landing/VectorWordmark"
import Header from "@/components/landing/Header"

const inter = Inter({ subsets: ["latin"], weight: ["500"] })

export default function LandingPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#111111] text-white">
      <Header />

      <div className="absolute inset-0">
        <VectorWordmark
          text="Foliomix"
          font={{
            fontFamily: inter.style.fontFamily,
            fontWeight: 500,
            fontSize: 240,
            letterSpacing: "-0.02em",
          }}
          reach={340}
          accent="#FFFFFF"
          textColor="#FFFFFF"
          shade="#5A5A5A"
          topGuard={180}
        />
      </div>

      <div className="fade-up absolute inset-x-0 bottom-[12vh] z-10 flex flex-col items-center gap-6 px-6 text-center">
        <p className="text-base text-neutral-400 md:text-lg">
          Your portfolio, live in minutes. From GitHub or your resume.
        </p>

        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3.5 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] active:scale-95"
        >
          <span className="shine" aria-hidden />
          <span className="relative">Get Started</span>
          <svg
            className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </main>
  )
}