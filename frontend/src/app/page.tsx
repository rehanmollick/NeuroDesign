"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { MeshData, ComparisonResult, PageState } from "@/lib/types"
import { loadPreset, compareImages, PRESETS } from "@/lib/api"
import PresetTabs from "@/components/PresetTabs"
import UploadZone from "@/components/UploadZone"
import CompareButton from "@/components/CompareButton"
import TopDifferences from "@/components/TopDifferences"
import Interpretation from "@/components/Interpretation"
import RegionDetail from "@/components/RegionDetail"

// Dynamic import for BrainViewer (SSR off, needs WebGL)
const BrainViewer = dynamic(() => import("@/components/BrainViewer"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center"
      style={{ aspectRatio: "1", color: "#8a8a9a", fontSize: "14px" }}
    >
      Loading brain model...
    </div>
  ),
})

export default function Home() {
  const [meshData, setMeshData] = useState<MeshData | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(PRESETS[0]?.id ?? null)
  const [pageState, setPageState] = useState<PageState>("initial")
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  // Load mesh data on mount
  useEffect(() => {
    fetch("/data/mesh.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load mesh")
        return res.json()
      })
      .then(setMeshData)
      .catch((err) => {
        console.error("Mesh load error:", err)
        setError("Unable to load brain model")
      })
  }, [])

  // Load initial preset on mount
  useEffect(() => {
    if (activePreset) {
      loadPreset(activePreset)
        .then((data) => {
          setComparison(data)
          setPageState("results")
        })
        .catch((err) => {
          console.error("Preset load error:", err)
        })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle preset tab click
  const handlePresetSelect = useCallback(async (presetId: string) => {
    setActivePreset(presetId)
    setFileA(null)
    setFileB(null)
    setError(null)

    try {
      const data = await loadPreset(presetId)
      setComparison(data)
      setPageState("results")
    } catch (err) {
      console.error("Preset load error:", err)
      setError("Failed to load preset comparison")
      setPageState("error")
    }
  }, [])

  // Handle file uploads
  const handleFileA = useCallback((file: File | null) => {
    setFileA(file)
    if (file) {
      setActivePreset(null)
      setPageState("uploading")
    }
  }, [])

  const handleFileB = useCallback((file: File | null) => {
    setFileB(file)
    if (file) {
      setActivePreset(null)
      setPageState("uploading")
    }
  }, [])

  // Handle compare
  const handleCompare = useCallback(async () => {
    if (!fileA || !fileB) {
      setError("Please upload both images")
      return
    }

    setPageState("scanning")
    setError(null)

    try {
      const data = await compareImages(fileA, fileB)

      // Check for identical images
      const allDeltasSmall = data.regions.every(
        (r) => Math.abs(r.delta) < 0.02
      )

      setComparison(data)
      setPageState("results")

      if (allDeltasSmall) {
        setError(
          "These images produce nearly identical brain responses. Try images with different visual content for the most interesting comparison."
        )
      }
    } catch (err) {
      console.error("Compare error:", err)
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "Request timed out (>110s). The GPU server may be cold — wait 30 seconds and try again, or explore a preset comparison."
        )
      } else {
        setError(
          "Analysis failed. Try a different image or explore a preset comparison."
        )
      }
      setPageState("error")
    }
  }, [fileA, fileB])

  // Find selected region data
  const selectedRegionData = comparison?.regions.find(
    (r) => r.name === selectedRegion
  ) ?? null

  const canCompare = fileA !== null && fileB !== null
  const isScanning = pageState === "scanning"

  return (
    <main
      className="flex flex-col min-h-screen page-main"
      style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px" }}
    >
      {/* Skip link for a11y */}
      <a href="#results" className="skip-link">
        Skip to comparison results
      </a>

      {/* Header */}
      <header className="mb-8 fade-up fade-up-1">
        <h1
          className="page-title"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#e8e6e3",
            marginBottom: "8px",
          }}
        >
          NEURODESIGN
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            color: "#8a8a9a",
          }}
        >
          See how the brain responds to your designs
        </p>
      </header>

      {/* Preset tabs */}
      <div className="mb-6 fade-up fade-up-2">
        <PresetTabs
          activePreset={activePreset}
          onSelect={handlePresetSelect}
        />
      </div>

      {/* Upload row */}
      <div className="upload-row flex gap-4 items-end mb-8 fade-up fade-up-3">
        <div className="flex-1 min-w-[140px]">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a8a9a",
              marginBottom: "8px",
            }}
          >
            IMAGE A
          </div>
          <UploadZone label="image A" file={fileA} onFileSelect={handleFileA} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a8a9a",
              marginBottom: "8px",
            }}
          >
            IMAGE B
          </div>
          <UploadZone label="image B" file={fileB} onFileSelect={handleFileB} />
        </div>
        <div className="flex-shrink-0">
          <CompareButton
            onClick={handleCompare}
            isLoading={isScanning}
            disabled={!canCompare}
            onPresetFallback={() => handlePresetSelect(PRESETS[0].id)}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mb-6"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: pageState === "error" ? "#ff6b6b" : "#8a8a9a",
            padding: "12px 16px",
            border: `1px solid ${pageState === "error" ? "#ff6b6b33" : "#1e1e2e"}`,
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* Brain viewers */}
      <div
        id="results"
        className="brain-grid fade-up fade-up-4"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          opacity: isScanning ? 0.4 : 1,
          transition: "opacity 200ms ease-out",
        }}
      >
        {/* Brain A */}
        <div className="flex flex-col gap-2">
          {comparison?.imageA.url && (
            <img
              src={comparison.imageA.url}
              alt={comparison.imageA.name}
              style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", borderRadius: "4px", border: "1px solid #1e1e2e" }}
            />
          )}
          <div style={{ maxWidth: "340px", margin: "0 auto", width: "100%" }}>
            <BrainViewer
              meshData={meshData}
              activations={comparison?.activations.imageA ?? null}
              label={comparison?.imageA.name ?? "Image A"}
              isLoading={isScanning}
              onRegionClick={(r) => setSelectedRegion(r)}
              resetKey={comparison?.imageA.name}
            />
          </div>
        </div>

        {/* Brain B */}
        <div className="flex flex-col gap-2">
          {comparison?.imageB.url && (
            <img
              src={comparison.imageB.url}
              alt={comparison.imageB.name}
              style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", borderRadius: "4px", border: "1px solid #1e1e2e" }}
            />
          )}
          <div style={{ maxWidth: "340px", margin: "0 auto", width: "100%" }}>
            <BrainViewer
              meshData={meshData}
              activations={comparison?.activations.imageB ?? null}
              label={comparison?.imageB.name ?? "Image B"}
              isLoading={isScanning}
              onRegionClick={(r) => setSelectedRegion(r)}
              resetKey={comparison?.imageB.name}
            />
          </div>
        </div>
      </div>

      {/* Color legends + diff brain */}
      {comparison && (
        <div className="fade-up fade-up-4 mt-2">
          {/* Legends row */}
          <div className="flex gap-8 justify-center mb-6" style={{ flexWrap: "wrap" }}>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8a8a9a" }}>LOW</span>
              <div style={{ width: "120px", height: "7px", borderRadius: "4px", background: "linear-gradient(to right, #080840, #0060ff, #00e5a0, #ffe000, #ff6000, #ff0000)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8a8a9a" }}>HIGH</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#4a4a5a", marginLeft: "4px" }}>activation</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#0060ff" }}>■</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#8a8a9a" }}>A activates more</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#ff0000", marginLeft: "8px" }}>■</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#8a8a9a" }}>B activates more</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#4a4a5a", marginLeft: "4px" }}>(difference brain)</span>
            </div>
          </div>

          {/* Diff brain — centered, smaller */}
          <div style={{ maxWidth: "300px", margin: "0 auto" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8a8a9a", textAlign: "center", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              B − A difference
            </div>
            <BrainViewer
              meshData={meshData}
              activations={comparison.activations.imageA}
              activationsB={comparison.activations.imageB}
              label=""
              isLoading={isScanning}
              resetKey={(comparison.imageA.name ?? "") + "-diff"}
            />
          </div>
        </div>
      )}

      {/* Results: bars + explanation */}
      {comparison && (
        <div className="mt-8 flex flex-col gap-8 fade-up fade-up-5">
          <TopDifferences regions={comparison.regions} />
          <Interpretation
            summary={comparison.summary}
            error={!comparison.summary && pageState === "results"}
          />
        </div>
      )}

      {/* Region detail panel */}
      <RegionDetail
        region={selectedRegionData}
        onClose={() => setSelectedRegion(null)}
      />
    </main>
  )
}
