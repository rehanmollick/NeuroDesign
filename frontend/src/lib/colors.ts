// Activation -> RGB interpolation

const DEFAULT = { r: 0x2a / 255, g: 0x2a / 255, b: 0x3a / 255 }

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Absolute activation: vivid rainbow-style scale
// dark blue → cyan → green → yellow → orange → red
function mapAbsolute(v: number): { r: number; g: number; b: number } {
  const stops = [
    { r: 0x08 / 255, g: 0x08 / 255, b: 0x40 / 255 }, // 0.0 deep indigo
    { r: 0x00 / 255, g: 0x60 / 255, b: 0xff / 255 }, // 0.2 blue
    { r: 0x00 / 255, g: 0xe5 / 255, b: 0xa0 / 255 }, // 0.4 cyan-green
    { r: 0xff / 255, g: 0xe0 / 255, b: 0x00 / 255 }, // 0.6 yellow
    { r: 0xff / 255, g: 0x60 / 255, b: 0x00 / 255 }, // 0.8 orange
    { r: 0xff / 255, g: 0x00 / 255, b: 0x00 / 255 }, // 1.0 red
  ]
  const seg = (stops.length - 1) * Math.max(0, Math.min(1, v))
  const i = Math.min(Math.floor(seg), stops.length - 2)
  const t = seg - i
  const a = stops[i], b = stops[i + 1]
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) }
}

// Difference map: blue (A wins) → dark gray → red (B wins)
function mapDiff(v: number): { r: number; g: number; b: number } {
  // v is already in [0,1] where 0.5 = no difference
  if (v < 0.5) {
    // A > B: blue tones
    const t = 1 - v * 2
    return {
      r: lerp(0.15, 0.05, t),
      g: lerp(0.15, 0.10, t),
      b: lerp(0.20, 0.85, t),
    }
  } else {
    // B > A: red tones
    const t = (v - 0.5) * 2
    return {
      r: lerp(0.15, 1.0, t),
      g: lerp(0.15, 0.08, t),
      b: lerp(0.20, 0.08, t),
    }
  }
}

export function activationToRGB(
  value: number,
  min = 0,
  max = 1,
  gamma = 1,
): { r: number; g: number; b: number } {
  if (value === null || value === undefined || isNaN(value)) return DEFAULT
  const range = max - min
  let v = range < 1e-6 ? 0.5 : Math.max(0, Math.min(1, (value - min) / range))
  if (gamma !== 1) v = Math.pow(v, gamma)
  return mapAbsolute(v)
}

// For difference heatmap: value is raw delta (B - A), absMax is the scale
export function diffToRGB(
  delta: number,
  absMax: number,
): { r: number; g: number; b: number } {
  if (delta === null || delta === undefined || isNaN(delta)) return DEFAULT
  if (absMax < 1e-6) return DEFAULT
  // Map [-absMax, +absMax] -> [0, 1]
  const v = Math.max(0, Math.min(1, (delta / absMax + 1) / 2))
  return mapDiff(v)
}

// CSS color string for UI elements (uses absolute scale)
export function activationToCSS(value: number): string {
  const { r, g, b } = activationToRGB(value)
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}
