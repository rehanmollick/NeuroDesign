"use client"

import { useState, useEffect } from "react"

interface CompareButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
  onPresetFallback?: () => void
}

// Staged status text for long inference waits
const STAGES = [
  { text: "UPLOADING...", after: 0 },
  { text: "PREDICTING BRAIN ACTIVITY...", after: 3000 },
  { text: "SCANNING IMAGE A...", after: 15000 },
  { text: "SCANNING IMAGE B...", after: 45000 },
  { text: "MAPPING BRAIN REGIONS...", after: 75000 },
  { text: "GENERATING AI ANALYSIS...", after: 100000 },
  { text: "ALMOST DONE...", after: 130000 },
]

export default function CompareButton({
  onClick,
  isLoading,
  disabled,
  onPresetFallback,
}: CompareButtonProps) {
  const [stageIdx, setStageIdx] = useState(0)
  const [showEscape, setShowEscape] = useState(false)

  // Cycle through staged status text while loading
  useEffect(() => {
    if (!isLoading) {
      setStageIdx(0)
      setShowEscape(false)
      return
    }

    const timers: NodeJS.Timeout[] = []

    STAGES.forEach((stage, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setStageIdx(i), stage.after))
      }
    })

    // Show escape hatch after 10s
    timers.push(setTimeout(() => setShowEscape(true), 10000))

    return () => timers.forEach(clearTimeout)
  }, [isLoading])

  const statusText = isLoading ? STAGES[stageIdx].text : "COMPARE"

  return (
    <div className="flex flex-col items-stretch">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-label={isLoading ? "Scanning images" : "Compare images"}
        className="transition-all duration-200"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "10px 24px",
          border: `1px solid ${disabled ? "#1e1e2e" : "#00e5a0"}`,
          borderRadius: "4px",
          background: disabled
            ? "transparent"
            : isLoading
            ? "#00e5a0"
            : "transparent",
          color: disabled
            ? "#8a8a9a"
            : isLoading
            ? "#0a0a0f"
            : "#00e5a0",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.background = "#00e5a0"
            e.currentTarget.style.color = "#0a0a0f"
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#00e5a0"
          }
        }}
      >
        {statusText}
      </button>

      {isLoading && (
        <>
          <div
            className="mt-2 overflow-hidden"
            style={{ height: "2px", borderRadius: "1px", background: "#1e1e2e" }}
          >
            <div
              className="h-full"
              style={{
                background: "#00e5a0",
                animation: "scan 2s ease-in-out infinite",
              }}
            />
          </div>

          {showEscape && onPresetFallback && (
            <button
              onClick={onPresetFallback}
              className="mt-2 transition-colors duration-200"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                color: "#8a8a9a",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Use preset comparison instead
            </button>
          )}
        </>
      )}
    </div>
  )
}
