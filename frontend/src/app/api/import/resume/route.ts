import Groq from "groq-sdk"
import { extractText, getDocumentProxy } from "unpdf"
import { NextResponse } from "next/server"
import { getSessionAndPortfolio, savePortfolio } from "@/lib/portfolio-db"
import { emptyPortfolio, mergePortfolio, normalize } from "@/lib/portfolio"

const PROMPT = `You extract portfolio data from text that was pulled out of a resume or a LinkedIn profile PDF.
The text may have odd line breaks or spacing from the PDF; read through that.
Respond with ONLY a JSON object using exactly these keys:
{
  "name": string,
  "headline": string (max 12 words, punchy),
  "about": string (2-3 sentences, first person),
  "location": string,
  "links": { "github": string, "linkedin": string, "website": string, "email": string },
  "skills": string[] (max 20),
  "experience": [{ "company": string, "role": string, "start": string, "end": string, "summary": string (1-2 sentences) }],
  "projects": [{ "title": string, "description": string, "url": string, "tech": string[] }],
  "education": [{ "school": string, "degree": string, "year": string }]
}
Use "" or [] when something is not in the text. Leave "end" as "" for a current job.
Never invent facts. You may write "headline" and "about" yourself, based only on what the text says.`

const isDev = process.env.NODE_ENV !== "production"

function isRateLimit(err: unknown) {
  const status = (err as { status?: number } | null)?.status
  const msg = err instanceof Error ? err.message : String(err)
  return status === 429 || /429|rate limit|quota|too many requests/i.test(msg)
}

export async function POST(request: Request) {
  const { supabase, user, row } = await getSessionAndPortfolio()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing GROQ_API_KEY." }, { status: 500 })
  }

  const form = await request.formData()
  const file = form.get("file")
  const source = form.get("source") === "linkedin" ? "linkedin" : "resume"

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received." }, { status: 400 })
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 })
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "That file is over 5 MB." }, { status: 400 })
  }

  // Step 1: pull the text out of the PDF
  let docText = ""
  try {
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()))
    const { text } = await extractText(pdf, { mergePages: true })
    docText = (Array.isArray(text) ? text.join("\n") : text).replace(/[ \t]+/g, " ").trim()
  } catch (err) {
    console.error("PDF reading failed:", err)
    return NextResponse.json(
      { error: "That PDF couldn't be opened. Is it password-protected?" },
      { status: 400 }
    )
  }

  if (docText.length < 50) {
    return NextResponse.json(
      {
        error:
          "We couldn't find any text in that PDF. If it's a scan or photo, export your resume as a PDF from Word or Google Docs instead.",
      },
      { status: 400 }
    )
  }

  // Keep the request a reasonable size
  docText = docText.slice(0, 30000)

  // Step 2: send the text to Groq, trying each model in order
  const models = (process.env.GROQ_MODELS || "openai/gpt-oss-120b")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)

  const groq = new Groq({ apiKey, maxRetries: 1 })
  let parsed
  let lastError: unknown

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PROMPT },
          { role: "user", content: `DOCUMENT TEXT:\n\n${docText}` },
        ],
      })

      const text = completion.choices[0]?.message?.content ?? ""
      const start = text.indexOf("{")
      const end = text.lastIndexOf("}")
      if (start === -1 || end === -1) throw new Error(`AI did not return JSON. Got: ${text.slice(0, 120)}`)
      parsed = normalize(JSON.parse(text.slice(start, end + 1)))
      break // success
    } catch (err) {
      lastError = err
      console.error(`Groq model ${model} failed:`, err)
      if (!isRateLimit(err)) break // a real error, another model won't help
    }
  }

  if (!parsed) {
    const busy = isRateLimit(lastError)
    const detail = lastError instanceof Error ? lastError.message : String(lastError)
    return NextResponse.json(
      {
        error: busy
          ? "Our AI is busy right now. Please try again in a minute."
          : isDev
            ? `Groq error: ${detail.slice(0, 300)}`
            : "We couldn't read that PDF. Try another file.",
      },
      { status: busy ? 429 : 502 }
    )
  }

  // Step 3: merge with existing details and save
  try {
    const merged = mergePortfolio(row?.data ?? emptyPortfolio, parsed)
    const sources = { ...(row?.sources ?? {}), [source]: file.name }
    await savePortfolio(supabase, user.id, { data: merged, sources })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Saving failed:", err)
    return NextResponse.json({ error: "Couldn't save your details." }, { status: 500 })
  }
}