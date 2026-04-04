"use client"

import { useRef, useMemo, useState, useCallback, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import { MeshData } from "@/lib/types"
import { activationToRGB, diffToRGB } from "@/lib/colors"

// Region function lookup (display names from regions.py)
const REGION_DISPLAY: Record<string, [string, string]> = {
  "G_oc-temp_lat-fusifor": ["Fusiform Gyrus", "Face recognition & visual objects"],
  "G_oc-temp_med-Lingual": ["Lingual Gyrus", "Visual word recognition & color"],
  "S_calcarine": ["Primary Visual Cortex", "Raw visual input processing"],
  "G_cuneus": ["Cuneus", "Basic edges & motion detection"],
  "G_front_middle": ["Dorsolateral Prefrontal", "Working memory & cognitive effort"],
  "G_front_inf-Orbital": ["Orbitofrontal Cortex", "Reward & emotional response"],
  "G_precuneus": ["Precuneus", "Self-reflection & spatial awareness"],
  "G_parietal_sup": ["Superior Parietal", "Spatial attention"],
  "G_pariet_inf-Angular": ["Angular Gyrus", "Reading & semantic memory"],
  "G_temporal_middle": ["Middle Temporal", "Object & scene recognition"],
  "G_insular_short": ["Insula", "Emotional salience & gut reactions"],
  "G_occipital_middle": ["Middle Occipital", "Complex shape processing"],
  "G_oc-temp_med-Parahip": ["Parahippocampal", "Scene recognition & spatial memory"],
}

interface TooltipProps {
  name: string
  fn: string
  pointer: { x: number; y: number }
}

function RegionTooltip({ name, fn }: { name: string; fn: string }) {
  return (
    <div
      style={{
        pointerEvents: "none",
        transform: "translate(12px, -8px)",
        background: "#12121a",
        border: "1px solid #1e1e2e",
        borderRadius: "4px",
        padding: "6px 10px",
        whiteSpace: "nowrap",
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
          fontSize: "11px",
          color: "#e8e6e3",
          marginBottom: "2px",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans, 'IBM Plex Sans', sans-serif)",
          fontSize: "11px",
          color: "#8a8a9a",
        }}
      >
        {fn}
      </div>
    </div>
  )
}

interface BrainMeshProps {
  meshData: MeshData
  activations: number[] | null
  activationsB?: number[] | null  // if provided, show diff (B - A)
  onRegionClick?: (region: string) => void
  isLoading?: boolean
}

function BrainMesh({ meshData, activations, activationsB, onRegionClick, isLoading }: BrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<THREE.Vector3 | null>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    const verts = new Float32Array(meshData.vertices.length * 3)
    for (let i = 0; i < meshData.vertices.length; i++) {
      verts[i * 3] = meshData.vertices[i][0]
      verts[i * 3 + 1] = meshData.vertices[i][1]
      verts[i * 3 + 2] = meshData.vertices[i][2]
    }

    const idx = new Uint32Array(meshData.faces.length * 3)
    for (let i = 0; i < meshData.faces.length; i++) {
      idx[i * 3] = meshData.faces[i][0]
      idx[i * 3 + 1] = meshData.faces[i][1]
      idx[i * 3 + 2] = meshData.faces[i][2]
    }

    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3))
    geo.setIndex(new THREE.BufferAttribute(idx, 1))
    geo.computeVertexNormals()

    const colors = new Float32Array(meshData.vertices.length * 3)
    colors.fill(0.16)
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    return geo
  }, [meshData])

  // Update vertex colors when activations change
  useEffect(() => {
    const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute
    const colors = colorAttr.array as Float32Array

    const isDiff = activationsB != null && activations != null

    if (isDiff) {
      // Diff mode: color = B - A, blue means A wins, red means B wins
      const deltas = activations!.map((a, i) => activationsB![i] - a)
      const absMax = Math.max(...deltas.map(Math.abs)) || 1
      for (let i = 0; i < meshData.vertices.length; i++) {
        const { r, g, b } = diffToRGB(deltas[i], absMax)
        colors[i * 3] = r
        colors[i * 3 + 1] = g
        colors[i * 3 + 2] = b
      }
    } else {
      // Absolute mode: vivid rainbow, 10th-90th percentile stretch
      let min = 0, max = 1
      if (activations && activations.length > 0) {
        const sorted = [...activations].sort((a, b) => a - b)
        min = sorted[Math.floor(sorted.length * 0.10)]
        max = sorted[Math.floor(sorted.length * 0.90)]
      }
      for (let i = 0; i < meshData.vertices.length; i++) {
        const val = activations ? activations[i] : NaN
        const { r, g, b } = activationToRGB(val, min, max, 0.55)
        colors[i * 3] = r
        colors[i * 3 + 1] = g
        colors[i * 3 + 2] = b
      }
    }
    colorAttr.needsUpdate = true
  }, [activations, activationsB, geometry, meshData.vertices.length])

  useFrame((state) => {
    if (isLoading && meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.6 + Math.sin(state.clock.elapsedTime * Math.PI) * 0.2
    }
  })

  const vertexToRegion = useMemo(() => {
    const lookup: Record<number, string> = {}
    for (const [region, indices] of Object.entries(meshData.regionMap)) {
      for (const idx of indices) lookup[idx] = region
    }
    return lookup
  }, [meshData.regionMap])

  const lastMove = useRef(0)

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerMove={(e) => {
          e.stopPropagation()
          const now = Date.now()
          if (now - lastMove.current < 60) return
          lastMove.current = now

          const faceIdx = e.faceIndex
          if (faceIdx === undefined || faceIdx === null) return
          const face = meshData.faces[faceIdx as number]
          if (!face) return

          const region = vertexToRegion[face[0]]
          if (region && region !== hoveredRegion) {
            setHoveredRegion(region)
            setTooltipPos(e.point.clone())
          } else if (!region) {
            setHoveredRegion(null)
            setTooltipPos(null)
          }
        }}
        onPointerLeave={() => {
          setHoveredRegion(null)
          setTooltipPos(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (hoveredRegion) onRegionClick?.(hoveredRegion)
        }}
      >
        <meshStandardMaterial
          vertexColors
          metalness={0.3}
          roughness={0.7}
          transparent={isLoading}
          opacity={isLoading ? 0.8 : 1}
        />
      </mesh>

      {/* Screen-space tooltip via drei Html */}
      {hoveredRegion && tooltipPos && (
        <Html position={tooltipPos} zIndexRange={[10, 20]}>
          <RegionTooltip
            name={REGION_DISPLAY[hoveredRegion]?.[0] ?? hoveredRegion.replace(/_/g, " ")}
            fn={REGION_DISPLAY[hoveredRegion]?.[1] ?? "Cortical region"}
          />
        </Html>
      )}
    </>
  )
}

function ParticleDust() {
  const ref = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const count = 40
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
    ref.current.rotation.x = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={1.5} color="#8a8a9a" transparent opacity={0.15} sizeAttenuation />
    </points>
  )
}

interface BrainViewerProps {
  meshData: MeshData | null
  activations: number[] | null
  activationsB?: number[] | null
  label: string
  isLoading?: boolean
  onRegionClick?: (region: string) => void
  resetKey?: string | number
}

export default function BrainViewer({
  meshData,
  activations,
  activationsB,
  label,
  isLoading,
  onRegionClick,
  resetKey,
}: BrainViewerProps) {
  return (
    <div className="relative w-full brain-entrance" style={{ aspectRatio: "1" }}>
      <div
        className="absolute top-3 left-3 z-10"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          letterSpacing: "0.08em",
          color: "#8a8a9a",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        {label}
      </div>

      {!meshData ? (
        <div
          className="flex items-center justify-center h-full"
          style={{ border: "1px solid #1e1e2e", borderRadius: "4px" }}
        >
          <span style={{ color: "#8a8a9a", fontSize: "14px" }}>
            Unable to load brain model
          </span>
        </div>
      ) : (
        <Canvas
          key={resetKey}
          camera={{ position: [0, 0, 250], fov: 45 }}
          style={{ background: "transparent" }}
          aria-label={`Brain activation heatmap for ${label}`}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <BrainMesh
            meshData={meshData}
            activations={activations}
            activationsB={activationsB}
            onRegionClick={onRegionClick}
            isLoading={isLoading}
          />
          <ParticleDust />
          <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan={false} />
        </Canvas>
      )}
    </div>
  )
}
