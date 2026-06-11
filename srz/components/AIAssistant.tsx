import { useCallback, useEffect, useRef, useState } from "react"
import { useAIAssistantStore } from "@/stores/aiAssistantStore"
import {
  ArrowUp,
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Minus,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const SUGGESTIONS = [
  { label: "Help me with lead time", icon: TrendingUp },
  { label: "Explain bottlenecks", icon: Box },
  { label: "Show WIP chart", icon: BarChart3 },
]

function AssistantLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      <div className="relative flex items-center justify-center py-1 xl:py-2">
        <div
          className="absolute h-[80px] w-[140px] rounded-full blur-2xl xl:h-[110px] xl:w-[180px]"
          style={{ background: "rgba(16, 207, 195, 0.18)" }}
        />
        <img
          src="/tra.svg"
          alt="Trooba AI"
          className="relative w-[130px] xl:w-[170px]"
          style={{ height: "auto" }}
        />
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center justify-center">
      <img
        src="/trooba-favicon-32.svg"
        alt="Trooba AI"
        className="h-[22px] w-[22px] rounded-[4px] xl:h-[26px] xl:w-[26px] xl:rounded-[5px]"
      />
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-1">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]"
          animate={{ opacity: [0.28, 1, 0.28], y: [0, -1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: item * 0.16 }}
        />
      ))}
    </span>
  )
}

function CollapsedTab({ onExpand }: { onExpand: () => void }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onExpand}
      className="fixed bottom-6 right-0 z-50 flex h-10 w-8 items-center justify-center rounded-l-lg transition hover:w-10"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,18,29,0.98) 0%, rgba(5,13,23,0.98) 100%)",
        border: "1px solid rgba(16,207,195,0.28)",
        borderRight: "none",
        boxShadow:
          "-4px 4px 20px rgba(0,0,0,0.3), 0 0 16px rgba(16,207,195,0.2)",
      }}
      aria-label="Open Trooba AI Assistant"
      title="Open Trooba AI Assistant"
    >
      <ChevronLeft className="h-4 w-4 text-[#9AA8BA]" />
    </motion.button>
  )
}

function MinimizedPill({
  onOpenChat,
  onCollapse,
}: {
  onOpenChat: () => void
  onCollapse: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.94 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed bottom-4 right-4 z-50 flex h-[44px] items-center rounded-xl text-white transition hover:-translate-y-0.5 xl:bottom-6 xl:right-8 xl:h-[54px] xl:rounded-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,18,29,0.98) 0%, rgba(5,13,23,0.98) 100%)",
        border: "1px solid rgba(16,207,195,0.28)",
        boxShadow:
          "0 22px 60px rgba(0,0,0,0.38), 0 0 34px rgba(16,207,195,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <button
        type="button"
        onClick={onOpenChat}
        className="flex h-full items-center gap-2 rounded-l-xl pl-3 pr-1.5 transition hover:bg-white/[0.04] xl:gap-3 xl:rounded-l-2xl xl:pl-4 xl:pr-2"
        aria-label="Open AI assistant"
      >
        <img src="/trooba-favicon-32.svg" alt="Trooba" className="h-[22px] w-[22px] xl:h-[26px] xl:w-[26px]" />
        <span className="text-[13px] font-semibold tracking-[-0.01em] xl:text-[15px]">Ask Trooba AI</span>
      </button>
      <button
        type="button"
        onClick={onCollapse}
        className="flex h-full items-center rounded-r-xl px-2.5 transition hover:bg-white/[0.06] xl:rounded-r-2xl xl:px-3"
        style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Collapse to edge"
      >
        <ChevronRight className="h-3.5 w-3.5 text-[#9AA8BA] xl:h-4 xl:w-4" />
      </button>
    </motion.div>
  )
}

export function AIAssistant() {
  const { view, messages, isThinking, openChat, showPill, collapse, sendMessage, handleSuggestion } =
    useAIAssistantStore()

  const [input, setInput] = useState("")
  const [hasScrolled, setHasScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollElRef = useRef<HTMLElement | null>(null)

  const scrollRef = useCallback((node: HTMLElement | null) => {
    if (scrollElRef.current) {
      scrollElRef.current.removeEventListener("scroll", handleScrollEvt)
    }
    scrollElRef.current = node
    if (node) {
      node.addEventListener("scroll", handleScrollEvt, { passive: true })
      setHasScrolled(node.scrollTop > 60)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScrollEvt() {
    if (scrollElRef.current) {
      setHasScrolled(scrollElRef.current.scrollTop > 60)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  useEffect(() => {
    if (view === "open") {
      window.setTimeout(() => inputRef.current?.focus(), 180)
    }
  }, [view])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(trimmed)
    setInput("")
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {view === "collapsed" && (
        <CollapsedTab key="tab" onExpand={showPill} />
      )}

      {view === "pill" && (
        <MinimizedPill key="pill" onOpenChat={openChat} onCollapse={collapse} />
      )}

      {view === "open" && (
        <motion.aside
          key="panel"
          initial={{ opacity: 0, x: 36, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 36, scale: 0.985 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-1 top-[56px] bottom-1 z-50 flex w-[280px] flex-col overflow-hidden rounded-[10px] text-white xl:right-2 xl:bottom-2 xl:w-[340px]"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(16,207,195,0.16) 0%, rgba(16,207,195,0.04) 28%, transparent 48%), linear-gradient(180deg, #07111E 0%, #04101B 50%, #030B14 100%)",
            border: "1px solid rgba(148,163,184,0.32)",
            boxShadow:
              "-24px 0 70px rgba(2,8,23,0.28), 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 top-16 h-48 w-48 rounded-full bg-[#10CFC3]/10 blur-3xl" />
            <div className="absolute -left-28 bottom-10 h-48 w-48 rounded-full bg-[#0EA5E9]/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <header className="relative flex h-[40px] shrink-0 items-center gap-2 px-3 xl:h-[46px] xl:gap-2.5 xl:px-5">
            {hasScrolled && (
              <img src="/tra.svg" alt="Trooba AI" className="h-[35px] w-auto xl:h-[45px]" />
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={showPill}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#CBD5E1] transition hover:bg-white/10 hover:text-white"
              aria-label="Minimize AI assistant"
              title="Minimize"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={collapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#CBD5E1] transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI assistant"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <main ref={scrollRef} className="relative flex-1 overflow-y-auto px-3 pb-2 pt-1.5 xl:px-4 xl:pb-3 xl:pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <section className="flex flex-col items-center text-center">
              <AssistantLogo />
              <h3 className="mt-2 text-[14px] font-bold tracking-[-0.03em] text-white xl:mt-3 xl:text-[17px]">
                Hi! How can I help?
              </h3>
              <p className="mt-1 max-w-[220px] text-[10.5px] leading-[1.5] text-[#BAC5D5] xl:mt-1.5 xl:max-w-[260px] xl:text-[11.5px]">
                I can help you explore your model with charts, insights, and quick answers.
              </p>
            </section>

            <section className="mt-3 space-y-1.5 xl:mt-4 xl:space-y-2">
              {SUGGESTIONS.map((suggestion) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => handleSuggestion(suggestion.label)}
                    className="group flex h-[34px] w-full items-center gap-2.5 rounded-lg px-3 text-left transition hover:border-[#10CFC3]/45 hover:bg-[#102333] xl:h-[38px] xl:gap-3 xl:px-3.5"
                    style={{
                      background: "rgba(15, 28, 43, 0.72)",
                      border: "1px solid rgba(148,163,184,0.28)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 text-[#10CFC3] transition group-hover:scale-105 xl:h-4 xl:w-4" />
                    <span className="text-[11px] font-medium text-white xl:text-[12.5px]">{suggestion.label}</span>
                  </button>
                )
              })}
            </section>

            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#334155]/65" />
              <span className="text-[11px] font-medium text-[#A9B5C6]">Today</span>
              <div className="h-px flex-1 bg-[#334155]/65" />
            </div>

            <section className="space-y-3">
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="flex flex-col items-end">
                      <div
                        className="max-w-[82%] rounded-xl rounded-br-sm px-2.5 py-1.5 text-[11px] font-medium leading-[1.5] text-white xl:px-3 xl:py-2 xl:text-[12px]"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16,207,195,0.72), rgba(5,132,124,0.78))",
                          boxShadow: "0 10px 26px rgba(16,207,195,0.12)",
                        }}
                      >
                        {message.content}
                      </div>
                      <div className="mt-1 flex items-center gap-1 pr-1 text-[10px] text-[#A9B5C6]">
                        <span>{formatTime(message.timestamp)}</span>
                        <span className="text-[#10CFC3]">✓</span>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={message.id} className="flex items-start gap-2">
                    <AssistantLogo size="sm" />
                    <div>
                      <div
                        className="max-w-[180px] rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[11px] leading-[1.5] text-white xl:max-w-[220px] xl:px-3 xl:py-2 xl:text-[12px]"
                        style={{
                          background: "rgba(30, 45, 63, 0.78)",
                          border: "1px solid rgba(148,163,184,0.08)",
                        }}
                      >
                        {message.content.split("\n").map((line, index) => (
                          <span key={`${message.id}-${index}`}>
                            {line}
                            {index < message.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      <span className="mt-1 block pl-1 text-[10px] text-[#A9B5C6]">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}

              {isThinking && (
                <div className="flex items-start gap-2">
                  <AssistantLogo size="sm" />
                  <div
                    className="rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[11px] leading-[1.5] text-white xl:px-3 xl:py-2 xl:text-[12px]"
                    style={{
                      background: "rgba(30, 45, 63, 0.78)",
                      border: "1px solid rgba(148,163,184,0.08)",
                    }}
                  >
                    Thinking <ThinkingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </section>
          </main>

          <footer className="relative shrink-0 px-2.5 pb-2 pt-1 xl:px-3 xl:pb-3 xl:pt-1.5">
            <div
              className="flex h-[42px] items-center gap-2 rounded-lg px-2.5 xl:h-[50px] xl:gap-2.5 xl:rounded-xl xl:px-3"
              style={{
                background: "rgba(9, 20, 34, 0.88)",
                border: "1px solid rgba(148,163,184,0.55)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Ask about charts, trends, or insights..."
                className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-white outline-none placeholder:text-[#A9B5C6] xl:text-[12px]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 xl:h-9 xl:w-9"
                style={{
                  background: "linear-gradient(135deg, #10CFC3, #0FAEA5)",
                  boxShadow: "0 0 24px rgba(16,207,195,0.34)",
                }}
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4 text-white xl:h-5 xl:w-5" strokeWidth={2.2} />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] leading-4 text-[#9AA8BA]">
              AI responses may not always be accurate. Please verify results.
            </p>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
