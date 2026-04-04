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
    <div style={{ maxWidth: "600px" }}>
      <h3
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#8a8a9a",
          marginBottom: "16px",
        }}
      >
        INTERPRETATION
      </h3>

      {isLoading ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "#8a8a9a",
            fontStyle: "italic",
          }}
        >
          Generating analysis...
        </p>
      ) : error ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "#8a8a9a",
          }}
        >
          Analysis unavailable. Quantitative comparison shown.
        </p>
      ) : summary ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            lineHeight: "1.65",
            color: "#e8e6e3",
          }}
        >
          {summary}
        </p>
      ) : null}
    </div>
  )
}
