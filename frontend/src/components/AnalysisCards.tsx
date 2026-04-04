"use client"

import { ComparisonResult } from "@/lib/types"

interface AnalysisCardsProps {
  comparison: ComparisonResult
}

function WinnerCard({ comparison }: { comparison: ComparisonResult }) {
  const detailed = comparison.detailed
  const winner = detailed?.winner
  const winnerName = winner === "A" ? comparison.imageA.name : winner === "B" ? comparison.imageB.name : null

  // Compute overall activation difference
  const avgA = comparison.regions.reduce((sum, r) => sum + r.activationA, 0) / comparison.regions.length
  const avgB = comparison.regions.reduce((sum, r) => sum + r.activationB, 0) / comparison.regions.length
  const diff = Math.abs(avgA - avgB) * 100

  return (
    <div style={{
      background: "#12121a",
      border: "1px solid #1e1e2e",
      borderRadius: "4px",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Accent glow */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #00e5a0, #00b4d8)",
      }} />
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#8a8a9a",
        marginBottom: "12px",
      }}>
        Overall Winner
      </div>
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: "28px",
        fontWeight: 600,
        color: "#00e5a0",
        marginBottom: "8px",
      }}>
        {winner === "tie" ? "TIE" : winnerName || (avgA > avgB ? comparison.imageA.name : comparison.imageB.name)}
      </div>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
        color: "#8a8a9a",
        lineHeight: 1.5,
      }}>
        {detailed?.winner_reason || `${diff.toFixed(1)}% stronger overall brain activation`}
      </div>
    </div>
  )
}

function InsightCard({ title, icon, content }: { title: string; icon: string; content: string }) {
  if (!content) return null
  return (
    <div style={{
      background: "#12121a",
      border: "1px solid #1e1e2e",
      borderRadius: "4px",
      padding: "24px",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#8a8a9a",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ fontSize: "14px" }}>{icon}</span>
        {title}
      </div>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
        color: "#e8e6e3",
        lineHeight: 1.65,
      }}>
        {content}
      </div>
    </div>
  )
}

function RecommendationsCard({ recommendations }: { recommendations: string[] }) {
  if (!recommendations || recommendations.length === 0) return null
  return (
    <div style={{
      background: "#12121a",
      border: "1px solid #1e1e2e",
      borderRadius: "4px",
      padding: "24px",
      gridColumn: "1 / -1",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#8a8a9a",
        marginBottom: "16px",
      }}>
        Design Recommendations
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#00e5a0",
              flexShrink: 0,
              marginTop: "2px",
            }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: "#e8e6e3",
              lineHeight: 1.5,
            }}>
              {rec}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalysisCards({ comparison }: AnalysisCardsProps) {
  const d = comparison.detailed

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
    }}>
      <WinnerCard comparison={comparison} />
      <InsightCard
        title="Emotional Impact"
        icon="~"
        content={d?.emotional_impact || ""}
      />
      <InsightCard
        title="Visual Attention"
        icon=">"
        content={d?.visual_attention || ""}
      />
      <InsightCard
        title="Memory Retention"
        icon="#"
        content={d?.memory_retention || ""}
      />
      <RecommendationsCard recommendations={d?.recommendations || []} />
    </div>
  )
}
