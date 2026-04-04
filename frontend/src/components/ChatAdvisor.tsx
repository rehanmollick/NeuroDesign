"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage, ComparisonResult } from "@/lib/types"
import { chatWithAdvisor } from "@/lib/api"

interface ChatAdvisorProps {
  comparison: ComparisonResult | null
  isOpen: boolean
  onClose: () => void
}

function ThinkingDots() {
  return (
    <div style={{
      display: "flex",
      gap: "6px",
      padding: "10px 14px",
      borderRadius: "12px 12px 12px 2px",
      background: "#1a1a28",
      border: "1px solid #1e1e2e",
    }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#00e5a0",
            display: "inline-block",
            animation: `dotPulse 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function ChatAdvisor({ comparison, isOpen, onClose }: ChatAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [autoSent, setAutoSent] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset chat when comparison changes
  useEffect(() => {
    setMessages([])
    setInput("")
    setAutoSent(false)
  }, [comparison?.imageA.name, comparison?.imageB.name])

  // Auto-send first question when opened
  useEffect(() => {
    if (isOpen && comparison && !autoSent && messages.length === 0) {
      setAutoSent(true)
      const firstQ = "Summarize which design is better and why, in 2-3 sentences."
      setMessages([{ role: "user", content: firstQ }])
      setLoading(true)
      chatWithAdvisor(firstQ, comparison.regions, comparison.summary, [], comparison.detailed)
        .then((response) => {
          setMessages((prev) => [...prev, { role: "assistant", content: response }])
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, I couldn't process that. Try again." },
          ])
        })
        .finally(() => {
          setLoading(false)
          inputRef.current?.focus()
        })
    }
  }, [isOpen, comparison, autoSent, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || !comparison || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await chatWithAdvisor(
        userMessage,
        comparison.regions,
        comparison.summary,
        messages,
        comparison.detailed
      )
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Try again." },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  if (!comparison) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 10, 15, 0.5)",
            zIndex: 90,
          }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(420px, 90vw)",
        background: "#0a0a0f",
        borderLeft: "1px solid #1e1e2e",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 300ms ease-out",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#00e5a0",
            animation: "glowPulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-heading)",
            fontSize: "16px",
            fontWeight: 600,
            color: "#e8e6e3",
          }}>
            Design Advisor
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "#8a8a9a",
            marginLeft: "auto",
          }}>
            Gemma 4
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#8a8a9a",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
            aria-label="Close chat"
          >
            x
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                background: msg.role === "user" ? "#1a2a20" : "#12121a",
                border: `1px solid ${msg.role === "user" ? "#00e5a033" : "#1e1e2e"}`,
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "#e8e6e3",
                lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <ThinkingDots />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #1e1e2e",
          display: "flex",
          gap: "10px",
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about this comparison..."
            disabled={loading}
            style={{
              flex: 1,
              background: "#12121a",
              border: "1px solid #1e1e2e",
              borderRadius: "4px",
              padding: "12px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: "#e8e6e3",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              background: input.trim() ? "#00e5a0" : "transparent",
              border: `1px solid ${input.trim() ? "#00e5a0" : "#1e1e2e"}`,
              borderRadius: "4px",
              padding: "0 20px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: input.trim() ? "#0a0a0f" : "#8a8a9a",
              cursor: input.trim() ? "pointer" : "default",
              transition: "all 200ms ease-out",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
