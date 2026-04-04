"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage, ComparisonResult } from "@/lib/types"
import { chatWithAdvisor } from "@/lib/api"

interface ChatAdvisorProps {
  comparison: ComparisonResult | null
}

export default function ChatAdvisor({ comparison }: ChatAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset chat when comparison changes
  useEffect(() => {
    setMessages([])
    setInput("")
  }, [comparison?.imageA.name, comparison?.imageB.name])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
        messages
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
    <div style={{
      background: "rgba(18, 18, 26, 0.7)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(30, 30, 46, 0.6)",
      borderRadius: "4px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "400px",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #1e1e2e",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#00e5a0",
          animation: "glowPulse 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#e8e6e3",
        }}>
          Design Advisor
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          color: "#8a8a9a",
          marginLeft: "auto",
        }}>
          Powered by Gemma 4
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#8a8a9a",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            lineHeight: 1.6,
          }}>
            Ask me anything about this comparison.
            <br />
            <span style={{ fontSize: "12px", color: "#4a4a5a" }}>
              "Which design is better for a landing page?"
              <br />
              "How can I improve the emotional impact?"
              <br />
              "What makes Image A grab more attention?"
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: msg.role === "user" ? "#1a2a20" : "#1a1a28",
              border: `1px solid ${msg.role === "user" ? "#00e5a033" : "#1e1e2e"}`,
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "#e8e6e3",
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
          }}>
            <div style={{
              padding: "10px 14px",
              borderRadius: "12px 12px 12px 2px",
              background: "#1a1a28",
              border: "1px solid #1e1e2e",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#8a8a9a",
            }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #1e1e2e",
        display: "flex",
        gap: "8px",
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
            background: "#0a0a0f",
            border: "1px solid #1e1e2e",
            borderRadius: "4px",
            padding: "10px 14px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
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
            padding: "0 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
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
  )
}
