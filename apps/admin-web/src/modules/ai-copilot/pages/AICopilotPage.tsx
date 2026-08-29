import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, Send, Bot, User, Utensils, Users, DollarSign, Briefcase, Terminal } from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input } from "@ssrone/ui";
import { cn } from "@/shared/utils/cn";
import { api, getAccessToken } from "@ssrone/api-client";
import { formatCurrency } from "@/shared/utils/formatters";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const AGENTS = [
  { id: "general", label: "General Assistant", icon: Sparkles },
  { id: "kitchen", label: "Kitchen Copilot", icon: Utensils },
  { id: "crm", label: "CRM Analytics", icon: Users },
  { id: "finance", label: "Finance Auditor", icon: DollarSign },
  { id: "ceo", label: "CEO Advisor", icon: Briefcase },
];

export function AICopilotPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (currentPath === "/ai/config") {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Bot className="text-primary" size={20} />
              AI Copilot LLM Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Configure generative model endpoints, API keys, and system prompts</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground">Select AI Provider</label>
            <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="gemini">Google Gemini 1.5 Pro</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="claude">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground">Temperature (Creativity VS Precision)</label>
            <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" className="w-full accent-primary bg-muted rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground">System Directive / Instruction Prompt</label>
            <textarea rows={4} defaultValue="You are Antigravity ERP Copilot. Help managers query tables, process checkout receipts, and audit inventory stocks." className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <Button onClick={() => toast.success("AI Model configuration updated!")} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">Update Configuration</Button>
        </div>
      </div>
    );
  }

  if (currentPath === "/ai/predict") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              AI Demand & Margin Forecasts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Predictive telemetry models for occupancy and kitchen requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Predicted Weekend Occupancy", rate: "86%", rule: "+12% vs last week" },
            { name: "Ingredient Demand Forecast", rate: "High Butter & Flour", rule: "Order PO by Friday" },
            { name: "Optimal Dynamic Room Rate", rate: "₹5,200/night", rule: "Recommended surge price" },
          ].map((f) => (
            <div key={f.name} className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{f.name}</p>
              <h3 className="text-lg font-black text-foreground">{f.rate}</h3>
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">{f.rule}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm SSR One AI Copilot. I can help you analyze revenue, forecast inventory, understand customer trends, and answer questions about your business. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeAgent, setActiveAgent] = useState("general");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    // Connect to backend AI endpoint
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Connect to actual API if token is not mock
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      const baseUrl = (import.meta as any).env.VITE_API_URL ?? "http://localhost:8000/api/v1";
      const response = await fetch(`${baseUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken() ?? ""}`,
        },
        body: JSON.stringify({ message: userMessage, agent_type: activeAgent, stream: true }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
          for (const line of lines) {
            const text = line.replace("data:", "").trim();
            if (text === "[DONE]") continue;
            accumulated += text + " ";
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: accumulated };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't connect to the AI service. Please check your backend configuration.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Agent Selector */}
      <div className="border-b border-border bg-surface px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
              activeAgent === agent.id ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
            style={activeAgent === agent.id ? { background: "hsl(var(--ai-primary))" } : undefined}
          >
            <agent.icon size={13} />
            {agent.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200", msg.role === "user" && "flex-row-reverse")}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{
                  background: msg.role === "assistant" ? "hsl(var(--ai-primary)/0.12)" : "hsl(var(--primary)/0.1)",
                }}
              >
                {msg.role === "assistant" ? (
                  <Bot size={14} style={{ color: "hsl(var(--ai-primary))" }} />
                ) : (
                  <User size={14} className="text-primary" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4.5 py-3 max-w-[75%] text-xs leading-relaxed shadow-card whitespace-pre-wrap",
                  msg.role === "assistant" ? "bg-card text-foreground border border-border" : "bg-primary text-primary-foreground",
                )}
              >
                {msg.content || (isStreaming && i === messages.length - 1 ? "Typing..." : "")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            placeholder="Ask about revenue, low stocks, hotel occupancy, or PG resident payments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" loading={isStreaming} style={{ background: "hsl(var(--ai-primary))", color: "white" }}>
            <Send size={14} />
          </Button>
        </form>
        <div className="text-3xs text-muted-foreground text-center mt-2 max-w-3xl mx-auto flex items-center justify-center gap-1.5">
          <Terminal size={10} />
          <span>Local Simulation Sandbox Active · Responses dynamic based on local databases</span>
        </div>
      </div>
    </div>
  );
}
