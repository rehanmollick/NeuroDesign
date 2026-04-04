"use client"

import { ComparisonResult } from "@/lib/types"

interface AnalysisCardsProps {
  comparison: ComparisonResult
}

function WinnerCard({ comparison }: { comparison: ComparisonResult }) {
  const detailed = comparison.detailed
  const winner = detailed?.winner
  const winnerName = winner === "A" ? comparison.imageA.name : winner === "B" ? comparison.imageB.name : null

  const avgA = comparison.regions.reduce((sum, r) => sum + r.activationA, 0) / comparison.regions.length
  const avgB = comparison.regions.reduce((sum, r) => sum + r.activationB, 0) / comparison.regions.length
  const diff = Math.abs(avgA - avgB) * 100

  return (
    <div className="analysis-card" style={{
      background: "rgba(18, 18, 26, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      padding: "28px",
      position: "relative",
      overflow: "hidden",
      gridColumn: "1 / -1",
    }}>
      {/* Accent glow line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #00e5a0, #00b4d8, transparent)",
      }} />
      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "-20px", left: "20px",
        width: "200px", height: "80px",
        background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div className="hud-header" style={{ marginBottom: "12px" }}>
            Overall Winner
          </div>
          <div style={{
            fontFamily: "var(--font-heading)",
            fontSize: "32px",
            fontWeight: 700,
            color: "#00e5a0",
            letterSpacing: "-0.02em",
            textShadow: "0 0 30px rgba(0,229,160,0.2)",
          }}>
            {winner === "tie" ? "TIE" : winnerName || (avgA > avgB ? comparison.imageA.name : comparison.imageB.name)}
          </div>
        </div>
        <div style={{ flex: 2, minWidth: "250px" }}>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "#8a8a9a",
            lineHeight: 1.6,
          }}>
            {detailed?.winner_reason || `${diff.toFixed(1)}% stronger overall brain activation`}
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ title, content, accentColor }: { title: string; content: string; accentColor: string }) {
  if (!content) return null
  return (
    <div className="analysis-card" style={{
      background: "rgba(18, 18, 26, 0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Left accent bar */}
      <div style={{
        position: "absolute",
        top: "12px", bottom: "12px", left: 0,
        width: "2px",
        background: accentColor,
        opacity: 0.5,
      }} />
      <div className="hud-header" style={{ marginBottom: "12px" }}>
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
    <div className="analysis-card" style={{
      background: "rgba(18, 18, 26, 0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      padding: "24px",
      gridColumn: "1 / -1",
    }}>
      <div className="hud-header" style={{ marginBottom: "20px" }}>
        Design Recommendations
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "#00e5a0",
              flexShrink: 0,
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,229,160,0.2)",
              borderRadius: "4px",
              background: "rgba(0,229,160,0.05)",
            }}>
              {i + 1}
            </div>
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
    <div className="analysis-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
    }}>
      <WinnerCard comparison={comparison} />
      <InsightCard
        title="Emotional Impact"
        content={d?.emotional_impact || ""}
        accentColor="#ff6b6b"
      />
      <InsightCard
        title="Visual Attention"
        content={d?.visual_attention || ""}
        accentColor="#00e5a0"
      />
      <InsightCard
        title="Memory Retention"
        content={d?.memory_retention || ""}
        accentColor="#00b4d8"
      />
      <RecommendationsCard recommendations={d?.recommendations || []} />
    </div>
  )
}
