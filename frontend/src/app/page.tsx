"use client"

import { useState, useEffect, useCallback } from "react"
import { MeshData, ComparisonResult, PageState } from "@/lib/types"
import { loadPreset, compareImages, PRESETS } from "@/lib/api"
import HeroSection from "@/components/HeroSection"
import PresetTabs from "@/components/PresetTabs"
import ImageColumn from "@/components/ImageColumn"
import CompareButton from "@/components/CompareButton"
import AnalysisSection from "@/components/AnalysisSection"
import ChatAdvisor from "@/components/ChatAdvisor"
import ChatFab from "@/components/ChatFab"
import RegionDetail from "@/components/RegionDetail"

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
  const [chatOpen, setChatOpen] = useState(false)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)

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

  useEffect(() => {
    if (activePreset) {
      loadPreset(activePreset)
        .then((data) => {
          setComparison(data)
          setPageState("results")
        })
        .catch((err) => console.error("Preset load error:", err))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetSelect = useCallback(async (presetId: string) => {
    setActivePreset(presetId)
    setFileA(null)
    setFileB(null)
    if (previewA) URL.revokeObjectURL(previewA)
    if (previewB) URL.revokeObjectURL(previewB)
    setPreviewA(null)
    setPreviewB(null)
    setError(null)
    try {
      const data = await loadPreset(presetId)
      setComparison(data)
      setPageState("results")
    } catch {
      setError("Failed to load preset comparison")
      setPageState("error")
    }
  }, [])

  const handleFileA = useCallback((file: File | null) => {
    setFileA(file)
    if (previewA) URL.revokeObjectURL(previewA)
    if (file) {
      setPreviewA(URL.createObjectURL(file))
      setActivePreset(null)
      setPageState("uploading")
    } else {
      setPreviewA(null)
    }
  }, [previewA])

  const handleFileB = useCallback((file: File | null) => {
    setFileB(file)
    if (previewB) URL.revokeObjectURL(previewB)
    if (file) {
      setPreviewB(URL.createObjectURL(file))
      setActivePreset(null)
      setPageState("uploading")
    } else {
      setPreviewB(null)
    }
  }, [previewB])

  const handleCompare = useCallback(async () => {
    if (!fileA || !fileB) { setError("Please upload both images"); return }
    setPageState("scanning")
    setScanning(true)
    setError(null)
    try {
      const data = await compareImages(fileA, fileB)
      const allDeltasSmall = data.regions.every((r) => Math.abs(r.delta) < 0.02)
      await new Promise((r) => setTimeout(r, 500))
      setScanning(false)
      setComparison(data)
      setPageState("results")
      if (allDeltasSmall) {
        setError("These images produce nearly identical brain responses. Try images with different visual content.")
      }
    } catch (err) {
      setScanning(false)
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. The GPU server may be cold, wait 30s and try again.")
      } else {
        setError("Analysis failed. Try a different image or explore a preset comparison.")
      }
      setPageState("error")
    }
  }, [fileA, fileB])

  const selectedRegionData = comparison?.regions.find((r) => r.name === selectedRegion) ?? null
  const canCompare = fileA !== null && fileB !== null
  const isScanning = pageState === "scanning"

  return (
    <main>
      <a href="#tool" className="skip-link">Skip to comparison tool</a>

      <HeroSection meshData={meshData} />

      {/* === MAIN TOOL === */}
      <section
        id="tool"
        style={{
          background: "#0a0a0f",
          borderTop: "1px solid #1e1e2e",
          padding: "32px clamp(20px, 5vw, 48px)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <PresetTabs activePreset={activePreset} onSelect={handlePresetSelect} />

          <div className="neon-line" style={{ marginTop: "20px", marginBottom: "20px" }} />

          <div className="tool-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}>
            <ImageColumn
              side="A"
              file={fileA}
              preview={previewA}
              comparison={comparison}
              meshData={meshData}
              scanning={scanning}
              isScanning={isScanning}
              onFileSelect={handleFileA}
              onRegionClick={setSelectedRegion}
            />
            <ImageColumn
              side="B"
              file={fileB}
              preview={previewB}
              comparison={comparison}
              meshData={meshData}
              scanning={scanning}
              isScanning={isScanning}
              onFileSelect={handleFileB}
              onRegionClick={setSelectedRegion}
            />
          </div>

          {(fileA || fileB) && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <CompareButton
                onClick={handleCompare}
                isLoading={isScanning}
                disabled={!canCompare}
                onPresetFallback={() => handlePresetSelect(PRESETS[0].id)}
              />
            </div>
          )}

          {/* Color legend */}
          <div style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "12px",
            alignItems: "center",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8a8a9a" }}>LOW</span>
            <div style={{
              width: "80px", height: "5px", borderRadius: "3px",
              background: "linear-gradient(to right, #080840, #0060ff, #00e5a0, #ffe000, #ff6000, #ff0000)",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8a8a9a" }}>HIGH</span>
          </div>

          {error && (
            <div style={{
              marginTop: "16px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: pageState === "error" ? "#ff6b6b" : "#8a8a9a",
              padding: "12px 16px",
              border: `1px solid ${pageState === "error" ? "#ff6b6b33" : "#1e1e2e"}`,
              borderRadius: "4px",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {comparison && <AnalysisSection comparison={comparison} />}

      <footer style={{
        borderTop: "1px solid #1e1e2e",
        padding: "32px 48px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          color: "#4a4a5a",
        }}>
          Built with{" "}
          <a href="https://github.com/facebookresearch/tribev2" target="_blank" rel="noopener noreferrer"
            style={{ color: "#8a8a9a", textDecoration: "none" }}>Meta TRIBE v2</a>
          {" "}and{" "}
          <a href="https://ai.google.dev/gemma" target="_blank" rel="noopener noreferrer"
            style={{ color: "#8a8a9a", textDecoration: "none" }}>Google Gemma 4</a>
        </p>
      </footer>

      {comparison && !chatOpen && <ChatFab onClick={() => setChatOpen(true)} />}

      <ChatAdvisor
        comparison={comparison}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <RegionDetail region={selectedRegionData} onClose={() => setSelectedRegion(null)} />
    </main>
  )
}
