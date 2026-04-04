"use client"

import { ComparisonResult } from "@/lib/types"

interface AnalysisCardsProps {
  comparison: ComparisonResult
}

interface InsightCardProps {
  title: string
  subtitle: string
  content: string
  accentColor: string
  align: "left" | "right"
}

function InsightCard({ title, subtitle, content, accentColor, align }: InsightCardProps) {
  if (!content) return null
  return (
    <div style={{
      width: "min(100%, 680px)",
      marginLeft: align === "right" ? "auto" : 0,
      marginRight: align === "left" ? "auto" : 0,
      background: "#12121a",
      border: "1px solid #1e1e2e",
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: "4px",
      padding: "32px",
      position: "relative",
      transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
    }}>
      {/* Accent glow */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "60px",
        height: "100%",
        background: `linear-gradient(90deg, ${accentColor}08, transparent)`,
        pointerEvents: "none",
      }} />

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#8a8a9a",
        marginBottom: "6px",
      }}>
        {subtitle}
      </div>
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: "20px",
        fontWeight: 600,
        color: accentColor,
        letterSpacing: "-0.02em",
        marginBottom: "16px",
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "16px",
        color: "#e8e6e3",
        lineHeight: 1.7,
      }}>
        {content}
      </div>
    </div>
  )
}

function RecommendationsSection({ recommendations }: { recommendations: string[] }) {
  if (!recommendations || recommendations.length === 0) return null
  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: "20px",
        fontWeight: 600,
        color: "#e8e6e3",
        letterSpacing: "-0.02em",
        marginBottom: "28px",
      }}>
        What To Do Next
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#0a0a0f",
              background: "#00e5a0",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              color: "#e8e6e3",
              lineHeight: 1.6,
              paddingTop: "6px",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Staggered insight cards */}
      <InsightCard
        title="Emotional Impact"
        subtitle="How it makes people feel"
        content={d?.emotional_impact || ""}
        accentColor="#ff6b6b"
        align="left"
      />
      <InsightCard
        title="Visual Attention"
        subtitle="Where the eye goes first"
        content={d?.visual_attention || ""}
        accentColor="#00b4d8"
        align="right"
      />
      <InsightCard
        title="Memory Retention"
        subtitle="What sticks in the mind"
        content={d?.memory_retention || ""}
        accentColor="#f5a623"
        align="left"
      />

      {/* Section connector */}
      <div className="section-connector" />

      {/* Recommendations */}
      <RecommendationsSection recommendations={d?.recommendations || []} />
    </div>
  )
}
