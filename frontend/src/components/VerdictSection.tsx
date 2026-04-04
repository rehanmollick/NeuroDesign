"use client"

import { ComparisonResult } from "@/lib/types"

interface VerdictSectionProps {
  comparison: ComparisonResult
}

export default function VerdictSection({ comparison }: VerdictSectionProps) {
  const detailed = comparison.detailed
  const winner = detailed?.winner
  const winnerName = winner === "A"
    ? comparison.imageA.name
    : winner === "B"
    ? comparison.imageB.name
    : null

  // Fallback: determine winner from average activation
  const avgA = comparison.regions.reduce((sum, r) => sum + r.activationA, 0) / comparison.regions.length
  const avgB = comparison.regions.reduce((sum, r) => sum + r.activationB, 0) / comparison.regions.length
  const fallbackWinner = avgA > avgB ? comparison.imageA.name : comparison.imageB.name
  const displayWinner = winner === "tie" ? "TIE" : winnerName || fallbackWinner

  // Top region difference for the "key advantage" callout
  const topRegion = [...comparison.regions].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]
  const topDelta = topRegion ? Math.abs(topRegion.delta * 100).toFixed(0) : null

  return (
    <div style={{
      minHeight: "50vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "64px 0",
      position: "relative",
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        height: "400px",
        background: "radial-gradient(ellipse, rgba(0,229,160,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Label */}
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#00e5a0",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <span style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00e5a0",
          boxShadow: "0 0 12px rgba(0,229,160,0.5)",
        }} />
        Neural Verdict
      </div>

      {/* Winner declaration */}
      <div style={{
        borderLeft: "3px solid #00e5a0",
        paddingLeft: "32px",
        boxShadow: "-8px 0 30px rgba(0,229,160,0.08)",
        marginBottom: "40px",
      }}>
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          color: "#e8e6e3",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: "8px",
        }}>
          {displayWinner === "TIE" ? "IT'S A TIE" : `${displayWinner}`}
        </div>
        {displayWinner !== "TIE" && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#00e5a0",
            textShadow: "0 0 20px rgba(0,229,160,0.3)",
          }}>
            Wins the neural comparison
          </div>
        )}
      </div>

      {/* Winner reason */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "18px",
        color: "#e8e6e3",
        lineHeight: 1.7,
        maxWidth: "640px",
        marginBottom: "40px",
      }}>
        {detailed?.winner_reason || comparison.summary || "This design triggers stronger neural activation across key brain regions."}
      </p>

      {/* Key advantage callout */}
      {topRegion && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px 28px",
          background: "#12121a",
          border: "1px solid #1e1e2e",
          borderRadius: "4px",
          maxWidth: "fit-content",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "28px",
            fontWeight: 600,
            color: "#00e5a0",
            lineHeight: 1,
          }}>
            {topDelta}%
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a8a9a",
              marginBottom: "4px",
            }}>
              Strongest Difference
            </div>
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              color: "#e8e6e3",
            }}>
              {topRegion.displayName} ({topRegion.function})
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
