import type { ComponentType } from "react"
import type { TemplateProps } from "./meta"
import Mono from "./Mono"
import PopPanel from "./PopPanel"
import Broadsheet from "./Broadsheet"
import Terminal from "./Terminal"

export const templateComponents: Record<string, ComponentType<TemplateProps>> = {
  mono: Mono,
  "pop-panel": PopPanel,
  broadsheet: Broadsheet,
  terminal: Terminal,
}