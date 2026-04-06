"use client"

interface ChatFabProps {
  onClick: () => void
}

export default function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      onClick={onClick}
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
  )
}
