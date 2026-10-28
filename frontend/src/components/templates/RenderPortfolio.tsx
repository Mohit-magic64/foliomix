import type { CSSProperties } from "react"
import { templateComponents } from "./registry"
import { fontFamilies } from "@/lib/fonts"
import { visibleSections, type Portfolio, type Theme } from "@/lib/portfolio"

export default function RenderPortfolio({
  templateId,
  data,
  theme,
}: {
  templateId: string | null
  data: Portfolio
  theme: Theme
}) {
  const Template = templateComponents[templateId ?? ""] ?? templateComponents.mono
  const heading = theme.headingFont ? fontFamilies[theme.headingFont] : undefined
  const body = theme.bodyFont ? fontFamilies[theme.bodyFont] : undefined

  const style = {
    "--fm-heading": heading,
    "--fm-body": body,
    "--fm-accent": theme.accent,
  } as CSSProperties

  return (
    <div
      className="fm-theme"
      data-heading={heading ? "" : undefined}
      data-body={body ? "" : undefined}
      style={style}
    >
      <Template data={data} sections={visibleSections(theme.sections)} />
    </div>
  )
}