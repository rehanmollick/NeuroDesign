"use client"

import { ComparisonResult } from "@/lib/types"

interface TopDifferencesProps {
  regions: ComparisonResult["regions"]
}

export default function TopDifferences({ regions }: TopDifferencesProps) {
  // Sort by absolute delta, take top 8
  const sorted = [...regions]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8)

  return (
    <div>
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
        TOP DIFFERENCES
      </h3>

      <div className="flex flex-col gap-3">
        {sorted.map((region) => (
          <div key={region.name}>
            <div
              className="flex justify-between items-center mb-1"
              style={{ fontSize: "13px" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#e8e6e3",
                  fontSize: "12px",
                }}
              >
                {region.displayName}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: region.delta > 0 ? "#00b4d8" : "#00e5a0",
                  fontSize: "12px",
                }}
              >
                {region.delta > 0 ? "+" : ""}
                {(region.delta * 100).toFixed(0)}%
              </span>
            </div>

            {/* Stacked bars */}
            <div className="flex flex-col gap-1">
              <div
                className="relative"
                style={{ height: "8px", background: "#1e1e2e", borderRadius: "4px" }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${Math.round(region.activationA * 100)}%`,
                    background: "#00e5a0",
                    borderRadius: "4px",
                    transition: "width 400ms ease-out",
                  }}
                />
              </div>
              <div
                className="relative"
                style={{ height: "8px", background: "#1e1e2e", borderRadius: "4px" }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${Math.round(region.activationB * 100)}%`,
                    background: "#00b4d8",
                    borderRadius: "4px",
                    transition: "width 400ms ease-out",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4" style={{ fontSize: "11px", color: "#8a8a9a" }}>
        <div className="flex items-center gap-1">
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#00e5a0" }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>IMAGE A</span>
        </div>
        <div className="flex items-center gap-1">
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#00b4d8" }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>IMAGE B</span>
        </div>
      </div>
    </div>
  )
}
