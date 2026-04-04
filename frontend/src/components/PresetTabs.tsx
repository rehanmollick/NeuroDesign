"use client"

import { PRESETS } from "@/lib/api"

interface PresetTabsProps {
  activePreset: string | null
  onSelect: (presetId: string) => void
}

export default function PresetTabs({ activePreset, onSelect }: PresetTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {PRESETS.map((preset) => {
        const isActive = activePreset === preset.id
        return (
          <button
            key={preset.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(preset.id)}
            className="whitespace-nowrap transition-colors duration-200 px-3 py-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isActive ? "#e8e6e3" : "#8a8a9a",
              background: "transparent",
              border: "none",
              borderBottom: isActive ? "2px solid #00e5a0" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
