import type { Portfolio, SectionId } from "@/lib/portfolio"

export type TemplateProps = { data: Portfolio ; sections?: SectionId[]}

export const categories = ["All", "Minimal", "Creative", "Editorial", "Developer"] as const
export type Category = (typeof categories)[number]

export type TemplateMeta = {
  id: string
  name: string
  category: Exclude<Category, "All">
  description: string
  fonts: string
  badge?: "Trending" | "New"
  accent?: string // default accent color; templates without one are monochrome
}

export const templateMeta: TemplateMeta[] = [
  {
    id: "mono",
    name: "Mono Glass",
    category: "Minimal",
    description: "A sleek black canvas with soft light and frosted-glass cards. Lets your work do the talking.",
    fonts: "Poppins",
    badge: "Trending",
  },
  {
    id: "pop-panel",
    name: "Pop Panel",
    category: "Creative",
    description: "Loud, playful comic-book panels with halftone dots, a speech-bubble bio, and sticker skills.",
    fonts: "Bangers · Space Grotesk",
    badge: "Trending",
    accent: "#E63946",
  },
  {
    id: "broadsheet",
    name: "Broadsheet",
    category: "Editorial",
    description: "Oversized headlines and newspaper columns in ink blue on newsprint.",
    fonts: "Anton · IBM Plex Mono",
    badge: "New",
    accent: "#1B2A6B",
  },
  {
    id: "terminal",
    name: "Terminal",
    category: "Developer",
    description: "A command-line portfolio for people who live in the terminal.",
    fonts: "JetBrains Mono",
    accent: "#4ADE80",
  },
]