// Activation -> RGB interpolation
// Cold: #1a3a5c (blue) -> Hot: #ff4d4d (red) via #ff8c00 (orange)

const COLD = { r: 0x1a / 255, g: 0x3a / 255, b: 0x5c / 255 }
const MID = { r: 0xff / 255, g: 0x8c / 255, b: 0x00 / 255 }
const HOT = { r: 0xff / 255, g: 0x4d / 255, b: 0x4d / 255 }
const DEFAULT = { r: 0x2a / 255, g: 0x2a / 255, b: 0x3a / 255 }

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function mapColor(v: number): { r: number; g: number; b: number } {
  if (v < 0.5) {
    const t = v * 2
    return {
      r: lerp(COLD.r, MID.r, t),
      g: lerp(COLD.g, MID.g, t),
      b: lerp(COLD.b, MID.b, t),
    }
  } else {
    const t = (v - 0.5) * 2
    return {
      r: lerp(MID.r, HOT.r, t),
      g: lerp(MID.g, HOT.g, t),
      b: lerp(MID.b, HOT.b, t),
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
  // Contrast-stretch: map [min, max] -> [0, 1]
  const range = max - min
  let v = range < 1e-6 ? 0.5 : Math.max(0, Math.min(1, (value - min) / range))
  // Gamma: < 1 pushes values toward hot end, making regional differences pop
  if (gamma !== 1) v = Math.pow(v, gamma)
  return mapColor(v)
}

// CSS color string for UI elements
export function activationToCSS(value: number): string {
  const { r, g, b } = activationToRGB(value)
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}
