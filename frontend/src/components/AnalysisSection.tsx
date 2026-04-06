"use client"

import { ComparisonResult } from "@/lib/types"
import FadeIn from "@/components/FadeIn"
import VerdictSection from "@/components/VerdictSection"
import AnalysisCards from "@/components/AnalysisCards"
import TopDifferences from "@/components/TopDifferences"

interface AnalysisSectionProps {
  comparison: ComparisonResult
}

export default function AnalysisSection({ comparison }: AnalysisSectionProps) {
  return (
    <section style={{
      background: "#0a0a0f",
      padding: "0 clamp(20px, 5vw, 48px)",
      position: "relative",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="section-connector" />

        <FadeIn>
          <VerdictSection comparison={comparison} />
        </FadeIn>

        <div className="section-connector" />

        <FadeIn delay={0.1}>
          <div style={{ padding: "40px 0" }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#8a8a9a",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{
                width: "24px",
                height: "1px",
                background: "#8a8a9a",
              }} />
              Detailed Analysis
            </div>
            <AnalysisCards comparison={comparison} />
          </div>
        </FadeIn>

        <div className="section-connector" />

        <FadeIn delay={0.15}>
          <div style={{ padding: "40px 0" }}>
            <TopDifferences regions={comparison.regions} />
          </div>
        </FadeIn>

      </div>
    </section>
  )
}
