"use client"

import { ComparisonResult } from "@/lib/types"

interface TopDifferencesProps {
  regions: ComparisonResult["regions"]
}

export default function TopDifferences({ regions }: TopDifferencesProps) {
  const sorted = [...regions]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6)

  const maxVal = Math.max(...sorted.map((r) => Math.max(r.activationA, r.activationB)))

  return (
    <div style={{
      background: "rgba(18, 18, 26, 0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      padding: "24px",
    }}>
      <div className="hud-header" style={{ marginBottom: "24px" }}>
        Brain Region Comparison
      </div>

      {/* Vertical bar chart */}
      <div style={{
        display: "flex",
        gap: "8px",
        alignItems: "flex-end",
        height: "180px",
        padding: "0 4px",
        borderBottom: "1px solid #1e1e2e",
      }}>
        {sorted.map((region) => {
          const heightA = maxVal > 0 ? (region.activationA / maxVal) * 100 : 0
          const heightB = maxVal > 0 ? (region.activationB / maxVal) * 100 : 0

          return (
            <div
              key={region.name}
              style={{
                flex: 1,
                display: "flex",
                gap: "3px",
                alignItems: "flex-end",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {/* Bar A */}
              <div style={{
                width: "16px",
                height: `${heightA}%`,
                background: "linear-gradient(180deg, #00e5a0, #00e5a044)",
                borderRadius: "3px 3px 0 0",
                transition: "height 600ms ease-out",
                minHeight: "4px",
                boxShadow: "0 0 8px rgba(0,229,160,0.15)",
              }} />
              {/* Bar B */}
              <div style={{
                width: "16px",
                height: `${heightB}%`,
                background: "linear-gradient(180deg, #00b4d8, #00b4d844)",
                borderRadius: "3px 3px 0 0",
                transition: "height 600ms ease-out",
                minHeight: "4px",
                boxShadow: "0 0 8px rgba(0,180,216,0.15)",
              }} />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginTop: "8px",
      }}>
        {sorted.map((region) => (
          <div
            key={region.name}
            style={{
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "#e8e6e3",
              lineHeight: 1.3,
              marginBottom: "2px",
            }}>
              {region.displayName}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: region.delta > 0 ? "#00b4d8" : "#00e5a0",
            }}>
              {region.delta > 0 ? "+" : ""}{(region.delta * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginTop: "16px",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#8a8a9a",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#00e5a0" }} />
          IMAGE A
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#8a8a9a",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#00b4d8" }} />
          IMAGE B
        </div>
      </div>
    </div>
  )
}
