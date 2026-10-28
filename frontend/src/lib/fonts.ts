import {
  Anton, Bangers, Bebas_Neue, DM_Serif_Display, Fraunces, IBM_Plex_Mono,
  Inter, JetBrains_Mono, Playfair_Display, Poppins, Space_Grotesk, Syne,
} from "next/font/google"
import type { FontId } from "@/lib/portfolio"

// Fonts used by the built-in templates
export const bangers = Bangers({ subsets: ["latin"], weight: "400" })
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })
export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })
export const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] })
export const jetbrains = JetBrains_Mono({ subsets: ["latin"] })

// Extra fonts users can pick in the editor
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], preload: false })
const inter = Inter({ subsets: ["latin"], preload: false })
const syne = Syne({ subsets: ["latin"], preload: false })
const playfair = Playfair_Display({ subsets: ["latin"], preload: false })
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", preload: false })
const fraunces = Fraunces({ subsets: ["latin"], preload: false })
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", preload: false })

export const fontFamilies: Record<FontId, string> = {
  poppins: poppins.style.fontFamily,
  inter: inter.style.fontFamily,
  "space-grotesk": spaceGrotesk.style.fontFamily,
  syne: syne.style.fontFamily,
  playfair: playfair.style.fontFamily,
  "dm-serif": dmSerif.style.fontFamily,
  fraunces: fraunces.style.fontFamily,
  bebas: bebas.style.fontFamily,
  anton: anton.style.fontFamily,
  bangers: bangers.style.fontFamily,
  "plex-mono": plexMono.style.fontFamily,
  jetbrains: jetbrains.style.fontFamily,
}