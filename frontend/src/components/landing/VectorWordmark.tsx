// Vector Wordmark 3 — Originkit (with intro glow)
"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MAX_DPR = 2
const REF_WIDTH = 1200
const MAX_TEX = 4096

const SWEEP_RATE = 0.5
const DAMP_REF = 20
const SPEED_REF = 50
const LABEL_MAX = 0.6
const DOT_DIAMETER = 4 / 440
const DOT_PITCH = 12 / 440

const SWEEP_BAND = 0.28
const GHOST = 0.07
const ANCHOR = 5.5
const KNOB = 4.5
const LINE_WIDTH = 1.4 // thickness of the pen line
const PEN_GLOW = 0.45 // soft glow around the pen line (0 = none)
const REVEAL_BOOST = 0.6 // extra brightness near the pen (0 = original)
const SWAY = 0.35
const SWAY_RATE = 0.9
const MIN_VEL = 0.02

// Intro timing (seconds)
const INTRO_DRAW = 1.8 // pen travels across the word
const INTRO_HOLD = 0.7 // whole word stays lit
const INTRO_FADE = 1.2 // fades back to dotted outline
const GLOW_PX = 22 // max glow size

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x)
const fract = (x: number) => x - Math.floor(x)

type RGBA = [number, number, number, number]

function parseColor(input: string | undefined, fallback: RGBA): RGBA {
    if (!input) return fallback
    let s = String(input).trim()
    if (s.slice(0, 4).toLowerCase() === "var(") {
        const comma = s.indexOf(",")
        const close = s.lastIndexOf(")")
        if (comma < 0 || close < comma) return fallback
        s = s.slice(comma + 1, close).trim()
    }
    if (s[0] === "#") {
        let h = s.slice(1)
        if (h.length === 3 || h.length === 4) {
            let x = ""
            for (const c of h) x += c + c
            h = x
        }
        if (h.length === 6) h += "ff"
        if (h.length !== 8 || /[^0-9a-f]/i.test(h)) return fallback
        return [
            parseInt(h.slice(0, 2), 16) / 255,
            parseInt(h.slice(2, 4), 16) / 255,
            parseInt(h.slice(4, 6), 16) / 255,
            parseInt(h.slice(6, 8), 16) / 255,
        ]
    }
    const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)$/i)
    if (!m) return fallback
    const parts = m[2].split(/[\s,/]+/).filter((p) => p.length > 0)
    if (parts.length < 3) return fallback
    const num = (t: string, scale: number) => {
        const v = parseFloat(t)
        if (!Number.isFinite(v)) return 0
        return t.indexOf("%") >= 0 ? (v / 100) * scale : v
    }
    const alpha = parts.length > 3 ? clamp(num(parts[3], 1), 0, 1) : 1
    if (m[1].toLowerCase().slice(0, 3) === "rgb") {
        return [
            clamp(num(parts[0], 255) / 255, 0, 1),
            clamp(num(parts[1], 255) / 255, 0, 1),
            clamp(num(parts[2], 255) / 255, 0, 1),
            alpha,
        ]
    }
    const hh = fract(parseFloat(parts[0]) / 360)
    const sat = clamp(num(parts[1], 1), 0, 1)
    const li = clamp(num(parts[2], 1), 0, 1)
    const q = li < 0.5 ? li * (1 + sat) : li + sat - li * sat
    const p = 2 * li - q
    const chan = (t: number) => {
        const u = fract(t)
        if (u < 1 / 6) return p + (q - p) * 6 * u
        if (u < 1 / 2) return q
        if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6
        return p
    }
    return [chan(hh + 1 / 3), chan(hh), chan(hh - 1 / 3), alpha]
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;

uniform sampler2D uMap;
uniform vec2 uRes;
uniform vec2 uAtlas;
uniform vec2 uPtr;
uniform float uReach;
uniform vec2 uDir;
uniform float uLen;
uniform vec3 uText;
uniform vec3 uShade;
uniform vec4 uAccent;
uniform float uFill;
uniform float uFillAmt;

varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 blurRG(vec2 uv, float e) {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < 6; i++) {
        float fi = float(i);
        float th = radians(fi / 6.0 * 360.0);
        vec2 dir = vec2(cos(th), sin(th));
        vec2 off = dir * (hash(vec2(fi, uv.x + uv.y)) + e);
        sum += texture2D(uMap, uv + off * e);
    }
    return (sum / 6.0).rg;
}

float stroke(float d, float lw, float px) {
    return 1.0 - smoothstep(lw, lw + px, d);
}

float segDist(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    vec2 ap = p - a;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    return length(ap - ab * t);
}

void main() {
    float aspect = uRes.x / uRes.y;

    vec2 E = (vUv * uRes - (uRes - uAtlas) * 0.5) / uAtlas;
    float inside = step(0.0, E.x) * step(E.x, 1.0) * step(0.0, E.y) * step(E.y, 1.0);
    vec2 safeUv = clamp(E, 0.0, 1.0);

    float b = clamp(1.0 - E.y * 3.5, 0.0, 1.0) * 0.008;
    vec2 soft = blurRG(safeUv, b);
    vec2 sharp = blurRG(safeUv, b * 0.1);

    float d = length((vUv - uPtr) / vec2(1.0, aspect));
    float k = 1.0 - pow(smoothstep(0.0, max(uReach, 1e-4), d), 3.0);

    // Intro: everything left of the pen stays lit
    float trail = (1.0 - smoothstep(uFill - 0.04, uFill + 0.01, E.x)) * uFillAmt;
    k = max(k, trail);

    float wire = max(sharp.g, soft.r * ${GHOST.toFixed(3)});
    float mask = mix(wire, soft.r, k) * inside;
    vec3 fill = mix(uShade, uText, smoothstep(0.0, 1.0, E.y));
    fill = mix(fill, uText, k * ${REVEAL_BOOST.toFixed(3)});
    float fade = mix(pow(clamp(E.y, 0.0, 1.0), 0.7), 1.0, k * ${REVEAL_BOOST.toFixed(3)});
    vec4 card = vec4(fill * mask, mask) * fade;

    vec2 p = vUv * uRes;
    vec2 a = uPtr * uRes;
    vec2 h1 = a + uDir * uLen;
    vec2 h2 = a - uDir * uLen;
    float sd = segDist(p, h1, h2);
    float line = max(stroke(sd, ${LINE_WIDTH.toFixed(3)}, 1.0), exp(-sd / 6.0) * ${PEN_GLOW.toFixed(3)});
    vec2 aq = abs(p - a) - vec2(${ANCHOR.toFixed(3)});
    float anchor = 1.0 - smoothstep(-0.5, 0.5, max(aq.x, aq.y));
    float knobs = max(
        1.0 - smoothstep(${KNOB.toFixed(3)} - 0.5, ${KNOB.toFixed(3)} + 0.5, length(p - h1)),
        1.0 - smoothstep(${KNOB.toFixed(3)} - 0.5, ${KNOB.toFixed(3)} + 0.5, length(p - h2))
    );
    float A = max(line, max(anchor, knobs)) * uAccent.a;

    gl_FragColor = vec4(uAccent.rgb * A, A) + card * (1.0 - A);
}`

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
    const make = (type: number, src: string) => {
        const sh = gl.createShader(type)!
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        return sh
    }
    const p = gl.createProgram()!
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs))
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs))
    gl.bindAttribLocation(p, 0, "aPos")
    gl.linkProgram(p)
    return p
}

type Atlas = { canvas: HTMLCanvasElement; cssW: number; cssH: number }

type FontSpec = {
    family: string
    weight: string
    style: string
    size: number
    letterSpacing: string
}

function fontString(f: FontSpec, px: number) {
    return `${f.style} ${f.weight} ${px}px ${f.family}`
}

function buildAtlas(
    text: string,
    f: FontSpec,
    drawFontPx: number,
    dpr: number
): Atlas | null {
    const probe = document.createElement("canvas").getContext("2d")
    if (!probe) return null

    const setFont = (ctx: CanvasRenderingContext2D, px: number) => {
        ctx.font = fontString(f, px)
        try {
            if ("letterSpacing" in ctx) {
                ;(ctx as unknown as { letterSpacing: string }).letterSpacing =
                    f.letterSpacing
            }
        } catch {}
    }

    const measure = (px: number) => {
        setFont(probe, px)
        const m = probe.measureText(text)
        const asc = m.actualBoundingBoxAscent || px * 0.8
        const desc = m.actualBoundingBoxDescent || px * 0.22
        return { w: Math.max(1, m.width), asc, desc }
    }

    let fpx = Math.max(8, drawFontPx * dpr)
    let m = measure(fpx)
    let pad = fpx * 0.12
    const over = Math.max(
        (m.w + pad * 2) / MAX_TEX,
        (m.asc + m.desc + pad * 2) / MAX_TEX
    )
    if (over > 1) {
        fpx = Math.max(8, fpx / over)
        m = measure(fpx)
        pad = fpx * 0.12
    }

    const w = Math.max(1, Math.ceil(m.w + pad * 2))
    const h = Math.max(1, Math.ceil(m.asc + m.desc + pad * 2))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, w, h)
    setFont(ctx, fpx)
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = "left"
    ctx.globalCompositeOperation = "lighter"

    ctx.fillStyle = "#ff0000"
    ctx.fillText(text, pad, pad + m.asc)

    const block = m.asc + m.desc
    ctx.strokeStyle = "#00ff00"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = Math.max(1, block * DOT_DIAMETER)
    ctx.setLineDash([0, Math.max(2, block * DOT_PITCH)])
    ctx.strokeText(text, pad, pad + m.asc)

    const cssPerPx = drawFontPx / fpx
    return { canvas, cssW: w * cssPerPx, cssH: h * cssPerPx }
}

type PenGroup = { length: number; labels: boolean }

const PEN_DEFAULTS: PenGroup = { length: 90, labels: true }

export interface VectorWordmarkBezierProps {
    text?: string
    font?: React.CSSProperties
    background?: string
    textColor?: string
    shade?: string
    accent?: string
    reach?: number
    speed?: number
    damping?: number
    pen?: Partial<PenGroup>
    intro?: boolean
    topGuard?: number // pixels from the top the pen can't enter
    style?: React.CSSProperties
}

function VectorWordmarkBase(props: VectorWordmarkBezierProps) {
    const {
        text = "Bezier",
        font = { fontSize: 240, fontFamily: "Inter", fontWeight: 400, letterSpacing: "-0.02em" },
        background = "#111111",
        textColor = "#F5F5F5",
        shade = "#2A2A2A",
        accent = "rgba(255, 92, 57, 0.85)",
        reach = 220,
        speed = 50,
        damping = 30,
        pen = { labels: true, length: 90 },
        intro = true,
        topGuard = 0,
        style,
    } = props

    const hg: PenGroup = { ...PEN_DEFAULTS, ...(pen ?? {}) }

    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const labelRefs = useRef<(HTMLDivElement | null)[]>([null, null])

    const rawSize = font?.fontSize
    const fontSpec: FontSpec = {
        family: (font?.fontFamily as string) || "Inter, system-ui, sans-serif",
        weight: String(font?.fontWeight ?? 500),
        style: font?.fontStyle === "italic" ? "italic" : "normal",
        size: Math.max(8, parseFloat(String(rawSize ?? 240)) || 240),
        letterSpacing: String(font?.letterSpacing ?? "0px"),
    }

    const accentRGBA = parseColor(accent, [1, 0.361, 0.224, 0.85])
    const labelColor = `rgb(${Math.round(accentRGBA[0] * 255)}, ${Math.round(
        accentRGBA[1] * 255
    )}, ${Math.round(accentRGBA[2] * 255)})`

    const live = useRef({
        text,
        fontSpec,
        textColor,
        shade,
        accentRGBA,
        reach,
        speed,
        damping,
        hg,
        intro,
        topGuard,
    })
    live.current.topGuard = topGuard
    live.current.text = text
    live.current.fontSpec = fontSpec
    live.current.textColor = textColor
    live.current.shade = shade
    live.current.accentRGBA = accentRGBA
    live.current.reach = reach
    live.current.speed = speed
    live.current.damping = damping
    live.current.hg = hg

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const attrs: WebGLContextAttributes = {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: true,
            powerPreference: "high-performance",
        }
        const gl = (canvas.getContext("webgl2", attrs) ||
            canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null
        if (!gl) return
        const isGL2 =
            typeof WebGL2RenderingContext !== "undefined" &&
            gl instanceof WebGL2RenderingContext

        const prog = compile(gl, VERT, FRAG)
        const U = {
            map: gl.getUniformLocation(prog, "uMap"),
            res: gl.getUniformLocation(prog, "uRes"),
            atlas: gl.getUniformLocation(prog, "uAtlas"),
            ptr: gl.getUniformLocation(prog, "uPtr"),
            reach: gl.getUniformLocation(prog, "uReach"),
            dir: gl.getUniformLocation(prog, "uDir"),
            len: gl.getUniformLocation(prog, "uLen"),
            text: gl.getUniformLocation(prog, "uText"),
            shade: gl.getUniformLocation(prog, "uShade"),
            accent: gl.getUniformLocation(prog, "uAccent"),
            fill: gl.getUniformLocation(prog, "uFill"),
            fillAmt: gl.getUniformLocation(prog, "uFillAmt"),
        }

        const quad = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        )
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.BLEND)

        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255])
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        let alive = true

        let boxW = Math.max(1, host.offsetWidth)
        let boxH = Math.max(1, host.offsetHeight)
        let boxDirty = true
        let dpr = 1
        let bufW = 0
        let bufH = 0

        let atlasRatioW = 1
        let atlasRatioH = 1
        let atlasKey = ""

        // Intro state
        const reduceMotion =
            typeof window !== "undefined" &&
            !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        let introDone = !live.current.intro || reduceMotion
        let introStarted = false
        let introT = 0
        let fill = 0
        let fillAmt = introDone ? 0 : 1
        let glow = 0
        let lastGlow = -1

        function drawFontPx() {
            return live.current.fontSpec.size * (boxW / REF_WIDTH)
        }

        function wordBounds() {
            const width = (atlasRatioW * Math.max(8, drawFontPx())) / boxW
            return { left: (1 - width) / 2, width }
        }

        function resize() {
            boxW = Math.max(1, host!.offsetWidth)
            boxH = Math.max(1, host!.offsetHeight)
            dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            const w = Math.max(1, Math.round(boxW * dpr))
            const h = Math.max(1, Math.round(boxH * dpr))
            if (w === bufW && h === bufH) return
            bufW = w
            bufH = h
            canvas!.width = w
            canvas!.height = h
        }

        function rebuildAtlas() {
            const L = live.current
            const f = L.fontSpec
            const px = Math.max(8, drawFontPx())
            const atlas = buildAtlas(L.text || " ", f, px, dpr)
            if (!atlas) return
            atlasRatioW = Math.max(1e-4, atlas.cssW / px)
            atlasRatioH = Math.max(1e-4, atlas.cssH / px)

            if (typeof document !== "undefined" && document.fonts) {
                try {
                    const probe = fontString(f, 64)
                    if (!document.fonts.check(probe)) {
                        const again = () => {
                            if (alive) atlasKey = ""
                        }
                        document.fonts.load(probe, L.text).then(again, again)
                    }
                } catch {}
            }
            gl!.bindTexture(gl!.TEXTURE_2D, tex)
            gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true)
            gl!.texImage2D(
                gl!.TEXTURE_2D,
                0,
                gl!.RGBA,
                gl!.RGBA,
                gl!.UNSIGNED_BYTE,
                atlas.canvas
            )
            gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false)
            const cw = atlas.canvas.width
            const ch = atlas.canvas.height
            const pot = (cw & (cw - 1)) === 0 && (ch & (ch - 1)) === 0

            if (isGL2 || pot) {
                gl!.generateMipmap(gl!.TEXTURE_2D)
                gl!.texParameteri(
                    gl!.TEXTURE_2D,
                    gl!.TEXTURE_MIN_FILTER,
                    gl!.LINEAR_MIPMAP_LINEAR
                )
            } else {
                gl!.texParameteri(
                    gl!.TEXTURE_2D,
                    gl!.TEXTURE_MIN_FILTER,
                    gl!.LINEAR
                )
            }
        }

        const target = { x: -0.5, y: 0.5 }
        const eased = { x: -0.5, y: 0.5 }
        const prev = { x: -0.5, y: 0.5 }
        let hasPointer = false
        let clock = 0
        let heading = 0

        // Listen on the whole window so the pen follows the mouse
        // even over the header and the button
        const onMove = (e: PointerEvent) => {
            hasPointer = true
            const r = host!.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            target.x = (e.clientX - r.left) / r.width
            const y = Math.max(e.clientY - r.top, live.current.topGuard)
            target.y = 1 - y / r.height
        }
        window.addEventListener("pointermove", onMove)

        let raf = 0
        let last = 0
        let running = true

        function sync() {
            const L = live.current
            if (boxDirty) {
                boxDirty = false
                resize()
            }
            const f = L.fontSpec
            const key = [
                L.text,
                f.family,
                f.weight,
                f.style,
                f.letterSpacing,
                dpr,
                Math.ceil(Math.max(8, drawFontPx()) / 64),
            ].join("|")
            if (key !== atlasKey) {
                atlasKey = key
                rebuildAtlas()
            }
        }

        function step(dt: number) {
            const L = live.current
            const rate = Math.max(0, L.speed) / SPEED_REF
            const band = (atlasRatioH * Math.max(8, drawFontPx())) / boxH
            const penY = (1 - band) / 2 + SWEEP_BAND * band

            if (!introDone) {
                // Intro: pen glides across the word (mouse ignored)
                introT += dt
                const wb = wordBounds()
                const p = clamp(introT / INTRO_DRAW, 0, 1)
                const e = 1 - Math.pow(1 - p, 3)
                target.x = wb.left - 0.02 + (wb.width + 0.04) * e
                target.y = penY
                if (!introStarted) {
                    introStarted = true
                    eased.x = prev.x = target.x
                    eased.y = prev.y = target.y
                }
            } else if (!hasPointer) {
                // No mouse yet: keep the original auto-sweep
                target.x += dt * SWEEP_RATE * rate
                target.y = penY
                if (target.x > 1.5) {
                    target.x = -0.5
                    eased.x = -0.5
                    prev.x = -0.5
                }
            }

            const damp = clamp((L.damping / 100) * DAMP_REF * dt, 0, 1)
            prev.x = eased.x
            prev.y = eased.y
            eased.x += (target.x - eased.x) * damp
            eased.y += (target.y - eased.y) * damp
            clock += dt * rate

            if (dt > 0) {
                const vx = ((eased.x - prev.x) * boxW) / dt
                const vy = ((eased.y - prev.y) * boxH) / dt
                if (Math.hypot(vx, vy) > MIN_VEL * boxW) {
                    let delta = Math.atan2(vy, vx) - heading
                    delta = Math.atan2(Math.sin(delta), Math.cos(delta))
                    heading += delta * damp
                }
            }

            if (!introDone) {
                const wb = wordBounds()
                fill = Math.max(fill, (eased.x - wb.left) / wb.width)
                const f = clamp(
                    (introT - INTRO_DRAW - INTRO_HOLD) / INTRO_FADE,
                    0,
                    1
                )
                fillAmt = 1 - f
                glow = clamp(fill, 0, 1) * (1 - f)
                if (f >= 1) {
                    introDone = true
                    fillAmt = 0
                    glow = 0
                }
            }
        }

        function tangent() {
            const a = heading + SWAY * Math.sin(clock * SWAY_RATE)
            return { x: Math.cos(a), y: Math.sin(a), a }
        }

        function writeLabels() {
            const L = live.current
            const t = tangent()
            const cx = eased.x * boxW
            const cy = (1 - eased.y) * boxH
            const pos = labelRefs.current[0]
            if (pos) {
                const gx = Math.round(clamp(eased.x * 100, 0, 100))
                const gy = Math.round(clamp(eased.y * 100, 0, 100))
                let nx = -t.y
                let ny = t.x
                if (ny > 0) {
                    nx = -nx
                    ny = -ny
                }
                pos.style.transform = `translate(${cx + nx * 22}px, ${
                    cy - ny * 22
                }px) translate(-50%, -50%)`
                pos.textContent = `${gx}, ${gy}`
            }
            const ang = labelRefs.current[1]
            if (ang) {
                const len = L.hg.length
                const deg = Math.round(((t.a * 180) / Math.PI % 360 + 360) % 360)
                ang.style.transform = `translate(${cx + t.x * len + 10}px, ${
                    cy - t.y * len - 16
                }px)`
                ang.textContent = `${deg}°`
            }
        }

        function writeGlow() {
            if (glow > 0 && Math.abs(glow - lastGlow) < 0.01) return
            if (glow === lastGlow) return
            lastGlow = glow
            canvas!.style.filter =
                glow > 0.01
                    ? `drop-shadow(0 0 ${Math.round(GLOW_PX * glow)}px rgba(255,255,255,${(
                          0.5 * glow
                      ).toFixed(2)}))`
                    : "none"
        }

        function draw() {
            const L = live.current
            const tc = parseColor(L.textColor, [0.859, 0.918, 0.992, 1])
            const sc = parseColor(L.shade, [0.035, 0.063, 0.102, 1])
            const ac = L.accentRGBA

            gl!.viewport(0, 0, bufW, bufH)
            gl!.useProgram(prog)
            gl!.uniform1i(U.map, 0)
            gl!.activeTexture(gl!.TEXTURE0)
            gl!.bindTexture(gl!.TEXTURE_2D, tex)
            gl!.uniform2f(U.res, boxW, boxH)
            const px = Math.max(8, drawFontPx())
            gl!.uniform2f(U.atlas, atlasRatioW * px, atlasRatioH * px)
            const t = tangent()
            gl!.uniform2f(U.ptr, eased.x, eased.y)
            gl!.uniform1f(U.reach, Math.max(1, L.reach) / boxW)
            gl!.uniform2f(U.dir, t.x, t.y)
            gl!.uniform1f(U.len, Math.max(1, L.hg.length))
            gl!.uniform3f(U.text, tc[0], tc[1], tc[2])
            gl!.uniform3f(U.shade, sc[0], sc[1], sc[2])
            gl!.uniform4f(U.accent, ac[0], ac[1], ac[2], ac[3])
            gl!.uniform1f(U.fill, fill)
            gl!.uniform1f(U.fillAmt, fillAmt)
            gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
        }

        const frame = (now: number) => {
            const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
            last = now
            sync()
            step(dt)
            writeLabels()
            writeGlow()
            draw()
            raf = requestAnimationFrame(frame)
        }

        const gate = () => {
            if (running && !document.hidden) {
                if (!raf) {
                    last = 0
                    raf = requestAnimationFrame(frame)
                }
            } else if (raf) {
                cancelAnimationFrame(raf)
                raf = 0
            }
        }

        const ro = new ResizeObserver(() => {
            boxDirty = true
        })
        ro.observe(host)
        document.addEventListener("visibilitychange", gate)

        if (typeof document !== "undefined" && document.fonts) {
            document.fonts.ready.then(
                () => {
                    if (alive) atlasKey = ""
                },
                () => {}
            )
        }

        gate()

        return () => {
            alive = false
            running = false
            if (raf) cancelAnimationFrame(raf)
            ro.disconnect()
            window.removeEventListener("pointermove", onMove)
            document.removeEventListener("visibilitychange", gate)
            canvas.style.filter = "none"
        }
    }, [])

    return (
        <div
            ref={hostRef}
            style={{
                position: "relative",
                overflow: "hidden",
                background,
                width: "100%",
                height: "100%",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
            {hg.labels
                ? [0, 1].map((i) => (
                      <div
                          key={i}
                          ref={(el) => {
                              labelRefs.current[i] = el
                          }}
                          style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              opacity: LABEL_MAX,
                              pointerEvents: "none",
                              whiteSpace: "nowrap",
                              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                              fontSize: 11,
                              letterSpacing: "0.08em",
                              color: labelColor,
                          }}
                      />
                  ))
                : null}
        </div>
    )
}

const presetProps: VectorWordmarkBezierProps = {
    text: "Foliomix",
    accent: "#FFFFFFD9",
    pen: { labels: true, length: 90 },
}

export default function VectorWordmarkBezier(props: VectorWordmarkBezierProps) {
    return <VectorWordmarkBase {...presetProps} {...props} />
}