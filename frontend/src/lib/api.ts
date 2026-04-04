import { ComparisonResult, PresetComparison, ChatMessage } from "./types"

const API_TIMEOUT = 110000 // 110s — Modal T4 cold start + inference can take 90s

export const PRESETS: PresetComparison[] = [
  { id: "apple-vs-cluttered", label: "Apple vs Cluttered", file: "apple-vs-cluttered.json" },
  { id: "face-vs-noface", label: "Face vs No Face", file: "face-vs-noface.json" },
  { id: "text-vs-infographic", label: "Text vs Visual", file: "text-heavy-vs-infographic.json" },
  { id: "clean-vs-ai", label: "Clean vs AI Cluttered", file: "clean-vs-ai-cluttered.json" },
]

export async function loadPreset(presetId: string): Promise<ComparisonResult> {
  const preset = PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown preset: ${presetId}`)

  const res = await fetch(`/data/comparisons/${preset.file}`)
  if (!res.ok) throw new Error(`Failed to load preset: ${res.status}`)
  return res.json()
}

async function fetchCompare(formData: FormData, timeoutMs: number): Promise<ComparisonResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/compare",
      { method: "POST", body: formData, signal: controller.signal }
    )
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function compareImages(
  imageA: File,
  imageB: File
): Promise<ComparisonResult> {
  const formData = new FormData()
  formData.append("imageA", imageA)
  formData.append("imageB", imageB)

  try {
    return await fetchCompare(formData, API_TIMEOUT)
  } catch (err) {
    // Auto-retry once on timeout (cold start)
    if (err instanceof DOMException && err.name === "AbortError") {
      const retryData = new FormData()
      retryData.append("imageA", imageA)
      retryData.append("imageB", imageB)
      return await fetchCompare(retryData, API_TIMEOUT)
    }
    throw err
  }
}

export async function chatWithAdvisor(
  message: string,
  regions: ComparisonResult["regions"],
  summary: string,
  history: ChatMessage[]
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, regions, summary, history }),
        signal: controller.signal,
      }
    )

    if (!res.ok) throw new Error(`Chat error: ${res.status}`)
    const data = await res.json()
    return data.response
  } finally {
    clearTimeout(timeout)
  }
}
