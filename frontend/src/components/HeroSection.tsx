"use client"

import dynamic from "next/dynamic"
import { MeshData } from "@/lib/types"

const HeroBrain = dynamic(() => import("@/components/HeroBrain"), {
  ssr: false,
  loading: () => null,
})

interface HeroSectionProps {
  meshData: MeshData | null
}

export default function HeroSection({ meshData }: HeroSectionProps) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      padding: "0 clamp(20px, 5vw, 80px)",
    }}>
      {/* Dramatic radial glow behind brain */}
      <div style={{
        position: "absolute",
        right: "5%",
        top: "50%",
        transform: "translateY(-50%)",
        width: "700px",
        height: "700px",
        background: "radial-gradient(circle, rgba(0,229,160,0.06) 0%, rgba(0,180,216,0.03) 40%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Secondary glow for depth */}
      <div style={{
        position: "absolute",
        right: "15%",
        top: "40%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
        filter: "blur(60px)",
      }} />

      {/* Content grid: text left, brain right */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        alignItems: "center",
      }}>
        {/* Left: copy */}
        <div style={{ zIndex: 1 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#00e5a0",
            marginBottom: "16px",
          }}>
            Neuromarketing for Everyone
          </div>

          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(48px, 7vw, 80px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#e8e6e3",
            lineHeight: 0.95,
            marginBottom: "24px",
          }}>
            NEURO
            <br />
            DESIGN
          </h1>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            color: "#8a8a9a",
            lineHeight: 1.6,
            maxWidth: "420px",
            marginBottom: "12px",
          }}>
            Upload two designs and see how the brain responds. Powered by Meta's
            TRIBE v2 fMRI prediction model and Google's Gemma 4.
          </p>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "#4a4a5a",
            lineHeight: 1.5,
            maxWidth: "420px",
            marginBottom: "32px",
          }}>
            Enterprise neuromarketing research used to cost $50K+ per study.
            Now it's instant, free, and in your browser.
          </p>

          <button
            onClick={() => {
              document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#0a0a0f",
              background: "#00e5a0",
              border: "none",
              padding: "14px 32px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#00ffb4"
              e.currentTarget.style.boxShadow = "0 0 24px rgba(0,229,160,0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#00e5a0"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            Try It Now
          </button>

          {/* Tech badges */}
          <div style={{
            marginTop: "48px",
            display: "flex",
            gap: "24px",
          }}>
            {[
              { label: "TRIBE v2", sub: "Meta AI" },
              { label: "Gemma 4", sub: "Google" },
              { label: "20,484", sub: "cortical points" },
            ].map((badge) => (
              <div key={badge.label}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  color: "#e8e6e3",
                  fontWeight: 500,
                }}>
                  {badge.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  color: "#4a4a5a",
                }}>
                  {badge.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: brain with glow ring */}
        <div style={{
          height: "min(70vh, 600px)",
          cursor: "crosshair",
          position: "relative",
        }}>
          {/* Glow ring behind brain */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            border: "1px solid rgba(0,229,160,0.1)",
            boxShadow: "0 0 60px rgba(0,229,160,0.05), inset 0 0 60px rgba(0,229,160,0.03)",
            pointerEvents: "none",
          }} />
          <HeroBrain meshData={meshData} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        animation: "pulse 2.5s ease-in-out infinite",
      }}>
        <svg
          width="20"
          height="12"
          viewBox="0 0 20 12"
          fill="none"
        >
          <path
            d="M1 1L10 10L19 1"
            stroke="#8a8a9a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  )
}
