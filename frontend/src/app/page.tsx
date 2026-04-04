"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, useInView } from "framer-motion"
import dynamic from "next/dynamic"
import { MeshData, ComparisonResult, PageState } from "@/lib/types"
import { loadPreset, compareImages, PRESETS } from "@/lib/api"
import HeroSection from "@/components/HeroSection"
import PresetTabs from "@/components/PresetTabs"
import UploadZone from "@/components/UploadZone"
import CompareButton from "@/components/CompareButton"
import TopDifferences from "@/components/TopDifferences"
import Interpretation from "@/components/Interpretation"
import RegionDetail from "@/components/RegionDetail"

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

// Fade-in wrapper for scroll-triggered sections
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [meshData, setMeshData] = useState<MeshData | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(PRESETS[0]?.id ?? null)
  const [pageState, setPageState] = useState<PageState>("initial")
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

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

  const handleCompare = useCallback(async () => {
    if (!fileA || !fileB) {
      setError("Please upload both images")
      return
    }

    setPageState("scanning")
    setScanning(true)
    setError(null)

    // Scanning animation: show for 1.5s then reveal results
    try {
      const data = await compareImages(fileA, fileB)

      const allDeltasSmall = data.regions.every(
        (r) => Math.abs(r.delta) < 0.02
      )

      // Hold scanning animation for at least 1.5s
      await new Promise((r) => setTimeout(r, 500))
      setScanning(false)
      setComparison(data)
      setPageState("results")

      if (allDeltasSmall) {
        setError(
          "These images produce nearly identical brain responses. Try images with different visual content for the most interesting comparison."
        )
      }
    } catch (err) {
      console.error("Compare error:", err)
      setScanning(false)
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

  const selectedRegionData = comparison?.regions.find(
    (r) => r.name === selectedRegion
  ) ?? null

  const canCompare = fileA !== null && fileB !== null
  const isScanning = pageState === "scanning"

  return (
    <main>
      {/* Skip link for a11y */}
      <a href="#demo" className="skip-link">
        Skip to comparison tool
      </a>

      {/* HERO: full viewport brain */}
      <HeroSection meshData={meshData} />

      {/* DEMO SECTION */}
      <section
        id="demo"
        style={{
          position: "relative",
          zIndex: 1,
          background: "#0a0a0f",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px 48px 0",
        }}
      >
        {/* Preset tabs */}
        <FadeInSection>
          <PresetTabs
            activePreset={activePreset}
            onSelect={handlePresetSelect}
          />
        </FadeInSection>

        {/* Upload row: compact */}
        <FadeInSection delay={0.05}>
          <div
            className="upload-row"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginTop: "24px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                color: "#8a8a9a",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              or drop your own
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: "200px" }}>
              <UploadZone label="image A" file={fileA} onFileSelect={handleFileA} compact />
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: "200px" }}>
              <UploadZone label="image B" file={fileB} onFileSelect={handleFileB} compact />
            </div>
            <div style={{ flexShrink: 0 }}>
              <CompareButton
                onClick={handleCompare}
                isLoading={isScanning}
                disabled={!canCompare}
                onPresetFallback={() => handlePresetSelect(PRESETS[0].id)}
              />
            </div>
          </div>
        </FadeInSection>

        {/* Error message */}
        {error && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: pageState === "error" ? "#ff6b6b" : "#8a8a9a",
              padding: "12px 16px",
              border: `1px solid ${pageState === "error" ? "#ff6b6b33" : "#1e1e2e"}`,
              borderRadius: "4px",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {/* Brain viewers */}
        <FadeInSection delay={0.1}>
          <div
            className="brain-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              position: "relative",
            }}
          >
            {/* Scanning overlay */}
            {scanning && (
              <>
                <div className="scan-overlay" style={{
                  position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    overflow: "hidden", borderRadius: "4px",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, width: "30%", height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(0,229,160,0.08), transparent)",
                      animation: "scanSweep 1.5s ease-in-out infinite",
                    }} />
                  </div>
                </div>
              </>
            )}

            {/* Brain A */}
            <div className="flex flex-col gap-2">
              {comparison?.imageA.url && (
                <img
                  src={comparison.imageA.url}
                  alt={comparison.imageA.name}
                  style={{
                    width: "100%", maxHeight: "120px", objectFit: "cover",
                    borderRadius: "4px", border: "1px solid #1e1e2e",
                  }}
                />
              )}
              <div style={{ maxWidth: "360px", margin: "0 auto", width: "100%" }}>
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
                  style={{
                    width: "100%", maxHeight: "120px", objectFit: "cover",
                    borderRadius: "4px", border: "1px solid #1e1e2e",
                  }}
                />
              )}
              <div style={{ maxWidth: "360px", margin: "0 auto", width: "100%" }}>
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
        </FadeInSection>

        {/* Color legend */}
        {comparison && (
          <FadeInSection delay={0.15}>
            <div className="flex gap-8 justify-center mt-4 mb-8" style={{ flexWrap: "wrap" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8a8a9a" }}>LOW</span>
                <div style={{ width: "100px", height: "6px", borderRadius: "3px", background: "linear-gradient(to right, #080840, #0060ff, #00e5a0, #ffe000, #ff6000, #ff0000)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#8a8a9a" }}>HIGH</span>
              </div>
            </div>
          </FadeInSection>
        )}

        {/* Results: interpretation first, then bars */}
        {comparison && (
          <div style={{ marginTop: "16px", marginBottom: "80px" }}>
            <FadeInSection delay={0.1}>
              <Interpretation
                summary={comparison.summary}
                error={!comparison.summary && pageState === "results"}
              />
            </FadeInSection>
            <FadeInSection delay={0.15}>
              <div style={{ marginTop: "32px" }}>
                <TopDifferences regions={comparison.regions} />
              </div>
            </FadeInSection>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #1e1e2e",
          padding: "32px 48px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "#8a8a9a",
          }}
        >
          Built with{" "}
          <a
            href="https://github.com/facebookresearch/tribev2"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e8e6e3", textDecoration: "none" }}
          >
            Meta TRIBE v2
          </a>{" "}
          and{" "}
          <a
            href="https://ai.google.dev/gemma"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e8e6e3", textDecoration: "none" }}
          >
            Google Gemma 4
          </a>
        </p>
      </footer>

      {/* Region detail panel */}
      <RegionDetail
        region={selectedRegionData}
        onClose={() => setSelectedRegion(null)}
      />
    </main>
  )
}
