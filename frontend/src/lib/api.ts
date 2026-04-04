import { ComparisonResult, PresetComparison, ChatMessage } from "./types"

const API_TIMEOUT = 180000 // 180s — TRIBE v2 inference + Gemma analysis takes ~120-140s

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

export async function compareImages(
  imageA: File,
  imageB: File
): Promise<ComparisonResult> {
  const formData = new FormData()
  formData.append("imageA", imageA)
  formData.append("imageB", imageB)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT)

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

export async function chatWithAdvisor(
  message: string,
  regions: ComparisonResult["regions"],
  summary: string,
  history: ChatMessage[],
  detailed?: ComparisonResult["detailed"]
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)

  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, regions, summary, history, detailed }),
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
