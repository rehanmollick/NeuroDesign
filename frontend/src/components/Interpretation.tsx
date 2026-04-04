"use client"

interface InterpretationProps {
  summary: string
  isLoading?: boolean
  error?: boolean
}

export default function Interpretation({
  summary,
  isLoading,
  error,
}: InterpretationProps) {
  return (
    <div style={{
      maxWidth: "700px",
      background: "rgba(18, 18, 26, 0.5)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "1px",
        background: "linear-gradient(90deg, rgba(0,229,160,0.3), transparent 60%)",
      }} />

      <div className="hud-header" style={{ marginBottom: "16px" }}>
        Interpretation
      </div>

      {isLoading ? (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          color: "#8a8a9a",
          fontStyle: "italic",
        }}>
          Generating analysis...
        </p>
      ) : error ? (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          color: "#8a8a9a",
        }}>
          Analysis unavailable. Quantitative comparison shown.
        </p>
      ) : summary ? (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: "1.65",
          color: "#e8e6e3",
        }}>
          {summary}
        </p>
      ) : null}
    </div>
  )
}
