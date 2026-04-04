"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import dynamic from "next/dynamic"
import { MeshData } from "@/lib/types"

const HeroBrain = dynamic(() => import("@/components/HeroBrain"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center"
      style={{ width: "100%", height: "100%", color: "#8a8a9a", fontSize: "14px" }}
    >
      Loading brain model...
    </div>
  ),
})

interface HeroSectionProps {
  meshData: MeshData | null
}

export default function HeroSection({ meshData }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])

  return (
    <div ref={containerRef} style={{ height: "100vh", position: "relative" }}>
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          opacity,
          scale,
        }}
      >
        {/* Brain canvas (fills entire hero) */}
        <div style={{ position: "absolute", inset: 0, cursor: "crosshair" }}>
          <HeroBrain meshData={meshData} />
        </div>

        {/* Title overlay */}
        <div
          className="hero-title"
          style={{
            position: "absolute",
            bottom: "25%",
            left: "clamp(20px, 5vw, 48px)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#e8e6e3",
              lineHeight: 1,
              marginBottom: "12px",
            }}
          >
            NEURODESIGN
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(14px, 1.5vw, 18px)",
              color: "#8a8a9a",
              maxWidth: "400px",
            }}
          >
            See how the brain responds to your designs
          </p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            pointerEvents: "none",
            textAlign: "center",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              color: "#8a8a9a",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Scroll to explore
          </div>
          <svg
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="none"
            style={{ margin: "0 auto" }}
          >
            <path
              d="M1 1L8 8L15 1"
              stroke="#8a8a9a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
