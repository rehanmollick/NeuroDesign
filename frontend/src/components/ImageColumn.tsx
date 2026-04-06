"use client"

import dynamic from "next/dynamic"
import { MeshData, ComparisonResult } from "@/lib/types"
import UploadZone from "@/components/UploadZone"

const BrainViewer = dynamic(() => import("@/components/BrainViewer"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center"
      style={{ aspectRatio: "1", color: "#8a8a9a", fontSize: "14px" }}
    >
      Loading...
    </div>
  ),
})

interface ImageColumnProps {
  side: "A" | "B"
  file: File | null
  preview: string | null
  comparison: ComparisonResult | null
  meshData: MeshData | null
  scanning: boolean
  isScanning: boolean
  onFileSelect: (file: File | null) => void
  onRegionClick: (region: string) => void
}

const SIDE_CONFIG = {
  A: { accent: "#00e5a0", borderAccent: "#00e5a033", label: "image A" },
  B: { accent: "#00b4d8", borderAccent: "#00b4d833", label: "image B" },
} as const

export default function ImageColumn({
  side,
  file,
  preview,
  comparison,
  meshData,
  scanning,
  isScanning,
  onFileSelect,
  onRegionClick,
}: ImageColumnProps) {
  const config = SIDE_CONFIG[side]
  const imageData = side === "A" ? comparison?.imageA : comparison?.imageB
  const activations = side === "A" ? comparison?.activations.imageA : comparison?.activations.imageB

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Image display or upload */}
      {file && preview ? (
        // User uploaded: show full-size preview with remove option
        <div style={{ position: "relative" }}>
          <div style={{
            position: "relative",
            borderRadius: "4px",
            overflow: "hidden",
            border: `1px solid ${config.borderAccent}`,
          }}>
            <img
              src={preview}
              alt={`Your Image ${side}`}
              style={{
                width: "100%",
                aspectRatio: "16/10",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 12px",
              background: "linear-gradient(transparent, rgba(10,10,15,0.9))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: config.accent,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Your Image {side}
              </span>
              <button
                onClick={() => onFileSelect(null)}
                style={{
                  background: "rgba(255,107,107,0.2)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "3px",
                  color: "#ff6b6b",
                  fontSize: "11px",
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : imageData?.url ? (
        // Preset active: show preset image + upload overlay
        <div style={{ position: "relative" }}>
          <div style={{
            position: "relative",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #1e1e2e",
          }}>
            <img
              src={imageData.url}
              alt={imageData.name}
              style={{
                width: "100%",
                aspectRatio: "16/10",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 12px",
              background: "linear-gradient(transparent, rgba(10,10,15,0.9))",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#e8e6e3",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {imageData.name}
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: "6px",
              opacity: 0.6,
              transition: "opacity 200ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6" }}
          >
            <UploadZone label={config.label} file={null} onFileSelect={onFileSelect} compact />
          </div>
        </div>
      ) : (
        // No preset, no upload: show full upload zone
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8a8a9a",
            marginBottom: "6px",
          }}>
            Image {side}
          </div>
          <UploadZone label={config.label} file={file} onFileSelect={onFileSelect} />
        </div>
      )}

      {/* Brain viewer */}
      <div style={{
        maxWidth: "320px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
      }}>
        {scanning && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
            overflow: "hidden", borderRadius: "4px",
          }}>
            <div style={{
              position: "absolute", width: "30%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(0,229,160,0.1), transparent)",
              animation: "scanSweep 1.5s ease-in-out infinite",
            }} />
          </div>
        )}
        <BrainViewer
          meshData={meshData}
          activations={activations ?? null}
          label=""
          isLoading={isScanning}
          onRegionClick={onRegionClick}
          resetKey={imageData?.name}
        />
      </div>
    </div>
  )
}
