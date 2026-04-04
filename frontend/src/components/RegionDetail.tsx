"use client"

import { ComparisonResult } from "@/lib/types"
import { activationToCSS } from "@/lib/colors"

interface RegionDetailProps {
  region: ComparisonResult["regions"][0] | null
  onClose: () => void
}

export default function RegionDetail({ region, onClose }: RegionDetailProps) {
  if (!region) return null

  const avgActivation = (region.activationA + region.activationB) / 2

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(10, 10, 15, 0.3)" }}
        onClick={onClose}
        aria-hidden="true"
      />
    <div
      className="fixed right-0 top-0 h-full z-50 transition-transform duration-200"
      style={{
        width: "360px",
        maxWidth: "100vw",
        background: "#12121a",
        borderLeft: "1px solid #1e1e2e",
        borderTop: `3px solid ${activationToCSS(avgActivation)}`,
        transform: "translateX(0)",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close region detail"
        className="absolute top-4 right-4"
        style={{
          background: "none",
          border: "none",
          color: "#8a8a9a",
          fontSize: "18px",
          cursor: "pointer",
          padding: "4px",
        }}
      >
        x
      </button>

      {/* Region name */}
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "18px",
          fontWeight: 500,
          color: "#e8e6e3",
          marginBottom: "4px",
          paddingRight: "32px",
        }}
      >
        {region.displayName}
      </h2>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#8a8a9a",
          letterSpacing: "0.05em",
          marginBottom: "16px",
        }}
      >
        {region.name}
      </p>

      {/* Function description */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#8a8a9a",
          marginBottom: "24px",
        }}
      >
        {region.function}
      </p>

      {/* Activation comparison */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between mb-1">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#8a8a9a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Image A
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "#00e5a0",
              }}
            >
              {(region.activationA * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 8, background: "#1e1e2e", borderRadius: 4 }}>
            <div
              style={{
                height: "100%",
                width: `${region.activationA * 100}%`,
                background: "#00e5a0",
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#8a8a9a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Image B
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "#00b4d8",
              }}
            >
              {(region.activationB * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 8, background: "#1e1e2e", borderRadius: 4 }}>
            <div
              style={{
                height: "100%",
                width: `${region.activationB * 100}%`,
                background: "#00b4d8",
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        {/* Delta */}
        <div
          className="mt-2 pt-3"
          style={{ borderTop: "1px solid #1e1e2e" }}
        >
          <div className="flex justify-between">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#8a8a9a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Delta (B - A)
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                fontWeight: 500,
                color: region.delta > 0 ? "#00b4d8" : "#00e5a0",
              }}
            >
              {region.delta > 0 ? "+" : ""}
              {(region.delta * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
