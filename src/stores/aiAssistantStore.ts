import { create } from "zustand"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type PanelView = "open" | "pill" | "collapsed"

interface AIAssistantState {
  view: PanelView
  messages: ChatMessage[]
  isThinking: boolean
  openChat: () => void
  showPill: () => void
  collapse: () => void
  sendMessage: (content: string) => void
  handleSuggestion: (suggestion: string) => void
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your Trooba Flow AI assistant.\nAsk me about WIP, lead time, bottlenecks, utilization, scrap, or production flow.",
    timestamp: new Date(),
  },
]

function getAssistantReply(content: string) {
  const prompt = content.toLowerCase()

  if (
    prompt.includes("wip") ||
    prompt.includes("work in progress") ||
    prompt.includes("inventory") ||
    prompt.includes("waiting stock") ||
    prompt.includes("queue")
  ) {
    return (
      "WIP shows how much work is waiting or being processed inside the factory.\n\n" +
      "High WIP usually means material is getting stuck before or after an operation. " +
      "Start by checking which product, operation, or equipment group has the highest waiting inventory."
    )
  }

  if (
    prompt.includes("lead time") ||
    prompt.includes("mct") ||
    prompt.includes("cycle time") ||
    prompt.includes("flow time") ||
    prompt.includes("delay")
  ) {
    return (
      "Lead time is the total time a product spends moving through the factory.\n\n" +
      "The biggest delays usually come from waiting time, queues, and overloaded resources. " +
      "Look for operations with high waiting time or repeated bottleneck behavior."
    )
  }

  if (
    prompt.includes("bottleneck") ||
    prompt.includes("constraint") ||
    prompt.includes("blocked") ||
    prompt.includes("capacity issue") ||
    prompt.includes("slow operation")
  ) {
    return (
      "A bottleneck is the operation or resource that limits the overall factory flow.\n\n" +
      "Good signs of a bottleneck are high utilization, long queues, growing WIP, and products waiting before the same step again and again."
    )
  }

  if (
    prompt.includes("utilization") ||
    prompt.includes("equipment") ||
    prompt.includes("machine") ||
    prompt.includes("resource") ||
    prompt.includes("idle") ||
    prompt.includes("busy")
  ) {
    return (
      "Equipment utilization shows how busy each machine or equipment group is.\n\n" +
      "Very high utilization can create queues, while very low utilization may show unused capacity. " +
      "The best focus is equipment with high run time and high waiting WIP."
    )
  }

  if (
    prompt.includes("scrap") ||
    prompt.includes("defect") ||
    prompt.includes("waste") ||
    prompt.includes("rejected") ||
    prompt.includes("loss")
  ) {
    return (
      "Scrap shows where material is being lost in the production flow.\n\n" +
      "Check which product or operation is creating the most scrap, then compare it with throughput and WIP to understand the real impact."
    )
  }

  if (
    prompt.includes("throughput") ||
    prompt.includes("production") ||
    prompt.includes("output") ||
    prompt.includes("good made") ||
    prompt.includes("good shipped") ||
    prompt.includes("finished") ||
    prompt.includes("delivered") ||
    prompt.includes("shipped")
  ) {
    return (
      "Throughput shows how much good output the factory is producing.\n\n" +
      "If production is low, compare finished units, delivered units, bottlenecks, WIP, and equipment utilization to find where the flow is slowing down."
    )
  }

  if (
    prompt.includes("what-if") ||
    prompt.includes("what if") ||
    prompt.includes("scenario") ||
    prompt.includes("simulation") ||
    prompt.includes("compare")
  ) {
    return (
      "What-if scenarios help you test changes before applying them in the real factory.\n\n" +
      "You can compare changes like adding capacity, reducing setup time, improving labor availability, reducing scrap, or removing a bottleneck."
    )
  }

  if (
    prompt.includes("chart") ||
    prompt.includes("graph") ||
    prompt.includes("trend") ||
    prompt.includes("visual") ||
    prompt.includes("dashboard")
  ) {
    return (
      "Charts help turn model results into quick decisions.\n\n" +
      "For a clear review, start with WIP trend, lead time trend, bottleneck heatmap, equipment utilization, and production output."
    )
  }

  if (
    prompt.includes("labor") ||
    prompt.includes("operator") ||
    prompt.includes("worker") ||
    prompt.includes("staff")
  ) {
    return (
      "Labor results show how operators are being used across the model.\n\n" +
      "Check labor utilization, unavailable time, machines waiting for labor, and operations where labor limits production flow."
    )
  }

  if (
    prompt.includes("product") ||
    prompt.includes("part") ||
    prompt.includes("item")
  ) {
    return (
      "Product results help you understand how each product moves through the factory.\n\n" +
      "Compare lead time, WIP, throughput, scrap, and bottleneck impact by product to find which product needs attention first."
    )
  }

  if (
    prompt.includes("operation") ||
    prompt.includes("process") ||
    prompt.includes("step") ||
    prompt.includes("routing")
  ) {
    return (
      "Operation results show where each process step is helping or slowing the flow.\n\n" +
      "Focus on operations with high wait time, high WIP, high utilization, or repeated bottleneck behavior."
    )
  }

  if (
    prompt.includes("ibom") ||
    prompt.includes("bom") ||
    prompt.includes("tree")
  ) {
    return (
      "IBOM shows the product structure and how parts connect inside the model.\n\n" +
      "Use it to understand parent-child relationships, product build flow, and where materials enter the production process."
    )
  }

  if (
    prompt.includes("basecase") ||
    prompt.includes("current result") ||
    prompt.includes("results current")
  ) {
    return (
      "The basecase is your current model result.\n\n" +
      "Use it as the starting point before testing what-if scenarios. Compare future scenarios against the basecase to see whether flow improves."
    )
  }

  if (
    prompt.includes("improve") ||
    prompt.includes("optimize") ||
    prompt.includes("reduce") ||
    prompt.includes("fix")
  ) {
    return (
      "To improve factory flow, start with the biggest constraint first.\n\n" +
      "Review bottlenecks, high WIP areas, long lead time products, and overloaded equipment. Then test one change at a time using what-if scenarios."
    )
  }

  if (
    prompt.includes("help") ||
    prompt.includes("what can you do") ||
    prompt.includes("guide") ||
    prompt.includes("explain")
  ) {
    return (
      "I can help you understand factory flow results such as WIP, lead time, bottlenecks, equipment utilization, labor usage, scrap, and production output.\n\n" +
      "Try asking: “Why is WIP high?”, “Where is the bottleneck?”, or “How can I reduce lead time?”"
    )
  }

  return (
    "I can help you explore your factory model results.\n\n" +
    "Ask me about WIP, lead time, bottlenecks, equipment utilization, labor, scrap, production output, IBOM, or what-if scenarios."
  )
}

export const useAIAssistantStore = create<AIAssistantState>((set, get) => ({
  // Use "pill" if you want the small Ask AI button by default.
  // Use "open" if you want the full assistant panel open by default.
  view: "open",

  messages: INITIAL_MESSAGES,
  isThinking: false,

  openChat: () => set({ view: "open" }),

  showPill: () => set({ view: "pill" }),

  collapse: () => set({ view: "collapsed" }),

  sendMessage: (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
    }))

    window.setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: getAssistantReply(trimmed),
        timestamp: new Date(),
      }

      set((state) => ({
        messages: [...state.messages, botMsg],
        isThinking: false,
      }))
    }, 900)
  },

  handleSuggestion: (suggestion: string) => {
    get().sendMessage(suggestion)
  },
}))