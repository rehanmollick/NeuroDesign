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
import VerdictSection from "@/components/VerdictSection"
import AnalysisCards from "@/components/AnalysisCards"
import ChatAdvisor from "@/components/ChatAdvisor"
import RegionDetail from "@/components/RegionDetail"

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

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
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
        setError("Request timed out after retrying. The GPU server may be under heavy load, try again in a minute.")
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

      {/* === HERO === */}
      <HeroSection meshData={meshData} />

      {/* === MAIN TOOL === one screen, no scroll needed */}
      <section
        id="tool"
        style={{
          background: "#0a0a0f",
          borderTop: "1px solid #1e1e2e",
          padding: "32px clamp(20px, 5vw, 48px)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Preset tabs */}
          <PresetTabs activePreset={activePreset} onSelect={handlePresetSelect} />

          {/* Neon divider */}
          <div className="neon-line" style={{ marginTop: "20px", marginBottom: "20px" }} />

          {/* Upload + Images + Brains: all on one screen */}
          <div className="tool-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}>
            {/* Column A */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Image display or upload */}
              {fileA && previewA ? (
                // User uploaded: show full-size preview with swap option
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #00e5a033",
                  }}>
                    <img
                      src={previewA}
                      alt="Your Image A"
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
                        color: "#00e5a0",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        Your Image A
                      </span>
                      <button
                        onClick={() => handleFileA(null)}
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
              ) : comparison?.imageA.url ? (
                // Preset active: show preset image + upload overlay
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #1e1e2e",
                  }}>
                    <img
                      src={comparison.imageA.url}
                      alt={comparison.imageA.name}
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
                        {comparison.imageA.name}
                      </span>
                    </div>
                  </div>
                  {/* Upload overlay */}
                  <div
                    style={{
                      marginTop: "6px",
                      opacity: 0.6,
                      transition: "opacity 200ms ease-out",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "1" }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6" }}
                  >
                    <UploadZone label="image A" file={null} onFileSelect={handleFileA} compact />
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
                    Image A
                  </div>
                  <UploadZone label="image A" file={fileA} onFileSelect={handleFileA} />
                </div>
              )}

              {/* Brain A */}
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
                  activations={comparison?.activations.imageA ?? null}
                  label=""
                  isLoading={isScanning}
                  onRegionClick={(r) => setSelectedRegion(r)}
                  resetKey={comparison?.imageA.name}
                />
              </div>
            </div>

            {/* Column B */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {fileB && previewB ? (
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #00b4d833",
                  }}>
                    <img
                      src={previewB}
                      alt="Your Image B"
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
                        color: "#00b4d8",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        Your Image B
                      </span>
                      <button
                        onClick={() => handleFileB(null)}
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
              ) : comparison?.imageB.url ? (
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #1e1e2e",
                  }}>
                    <img
                      src={comparison.imageB.url}
                      alt={comparison.imageB.name}
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
                        {comparison.imageB.name}
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
                    <UploadZone label="image B" file={null} onFileSelect={handleFileB} compact />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8a8a9a",
                    marginBottom: "6px",
                  }}>
                    Image B
                  </div>
                  <UploadZone label="image B" file={fileB} onFileSelect={handleFileB} />
                </div>
              )}

              {/* Brain B */}
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
                  activations={comparison?.activations.imageB ?? null}
                  label=""
                  isLoading={isScanning}
                  onRegionClick={(r) => setSelectedRegion(r)}
                  resetKey={comparison?.imageB.name}
                />
              </div>
            </div>
          </div>

          {/* Compare button for custom uploads */}
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

          {/* Error */}
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

      {/* === ANALYSIS SECTION === cinematic story flow */}
      {comparison && (
        <section style={{
          background: "#0a0a0f",
          padding: "0 clamp(20px, 5vw, 48px)",
          position: "relative",
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

            {/* Section connector */}
            <div className="section-connector" />

            {/* VERDICT — the centerpiece */}
            <FadeIn>
              <VerdictSection comparison={comparison} />
            </FadeIn>

            {/* Section connector */}
            <div className="section-connector" />

            {/* INSIGHTS + RECOMMENDATIONS */}
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

            {/* Section connector */}
            <div className="section-connector" />

            {/* BRAIN REGION CHART — full width */}
            <FadeIn delay={0.15}>
              <div style={{ padding: "40px 0" }}>
                <TopDifferences regions={comparison.regions} />
              </div>
            </FadeIn>

          </div>
        </section>
      )}

      {/* === FOOTER === */}
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

      {/* Chat FAB button */}
      {comparison && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#00e5a0",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
            animation: "fabPulse 2s ease-in-out infinite",
            transition: "transform 200ms ease-out",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)" }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
          aria-label="Open Design Advisor chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat sidebar */}
      <ChatAdvisor
        comparison={comparison}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <RegionDetail region={selectedRegionData} onClose={() => setSelectedRegion(null)} />
    </main>
  )
}
