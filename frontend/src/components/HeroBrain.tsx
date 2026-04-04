"use client"

import { useRef, useMemo, useCallback, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { MeshData } from "@/lib/types"

// Synapse pulse: randomly fire 2-3 regions with accent green
function SynapsingBrain({ meshData }: { meshData: MeshData }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const activeRegions = useRef<Map<string, number>>(new Map())
  const lastPulse = useRef(0)

  const regionNames = useMemo(() => Object.keys(meshData.regionMap), [meshData.regionMap])

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
    // Base color: #2a2a3a
    for (let i = 0; i < meshData.vertices.length; i++) {
      colors[i * 3] = 0x2a / 255
      colors[i * 3 + 1] = 0x2a / 255
      colors[i * 3 + 2] = 0x3a / 255
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [meshData])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute
    const colors = colorAttr.array as Float32Array

    // Fire new regions every 2-3 seconds
    if (elapsed - lastPulse.current > 2 + Math.random()) {
      lastPulse.current = elapsed
      const count = 2 + Math.floor(Math.random() * 2) // 2-3 regions
      for (let i = 0; i < count; i++) {
        const region = regionNames[Math.floor(Math.random() * regionNames.length)]
        if (!activeRegions.current.has(region)) {
          activeRegions.current.set(region, elapsed)
        }
      }
    }

    // Reset all to base
    for (let i = 0; i < meshData.vertices.length; i++) {
      colors[i * 3] = 0x2a / 255
      colors[i * 3 + 1] = 0x2a / 255
      colors[i * 3 + 2] = 0x3a / 255
    }

    // Apply pulses
    const toRemove: string[] = []
    activeRegions.current.forEach((startTime, region) => {
      const age = elapsed - startTime
      const duration = 1.5
      if (age > duration) {
        toRemove.push(region)
        return
      }
      // Sine curve: 0 -> 1 -> 0
      const intensity = Math.sin((age / duration) * Math.PI) * 0.6
      const indices = meshData.regionMap[region]
      if (!indices) return
      for (const idx of indices) {
        // Blend toward bright accent green #00ffc8 (brighter than base accent)
        colors[idx * 3] = colors[idx * 3] + (0.1 - colors[idx * 3]) * intensity
        colors[idx * 3 + 1] = colors[idx * 3 + 1] + (1.0 - colors[idx * 3 + 1]) * intensity
        colors[idx * 3 + 2] = colors[idx * 3 + 2] + (0.78 - colors[idx * 3 + 2]) * intensity
      }
    })
    toRemove.forEach((r) => activeRegions.current.delete(r))

    colorAttr.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        metalness={0.55}
        roughness={0.35}
        envMapIntensity={0.8}
      />
    </mesh>
  )
}

// Particle dust (same as existing but slightly more particles for hero)
function HeroParticles() {
  const ref = useRef<THREE.Points>(null)
  const particles = useMemo(() => {
    const count = 60
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 50
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
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
    ref.current.rotation.x = state.clock.elapsedTime * 0.008
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={1.2} color="#8a8a9a" transparent opacity={0.12} sizeAttenuation />
    </points>
  )
}

interface HeroBrainProps {
  meshData: MeshData | null
}

export default function HeroBrain({ meshData }: HeroBrainProps) {
  if (!meshData) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: "100%", height: "100%" }}
      >
        <span style={{ color: "#8a8a9a", fontSize: "14px" }}>
          Loading brain model...
        </span>
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 220], fov: 50 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      aria-label="Interactive 3D brain with synapse pulse animation"
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={0.4} color="#00e5a0" />
      <directionalLight position={[0, -5, -3]} intensity={0.15} color="#00b4d8" />
      <SynapsingBrain meshData={meshData} />
      <HeroParticles />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  )
}
