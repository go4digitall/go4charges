import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AnalyticsContext {
  sessions?: number;
  pageViews?: number;
  addToCart?: number;
  avgTimeOnPage?: number;
  avgScrollDepth?: number;
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
  conversionRate?: string;
  metaAdsData?: MetaAdsData | null;
}

interface MetaAdsData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

interface MarketingChatBotProps {
  analyticsContext: AnalyticsContext;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-chat`;

const generateSessionId = () => {
  const stored = sessionStorage.getItem("marketing_chat_session_id");
  if (stored) return stored;
  
  const newId = `mkt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem("marketing_chat_session_id", newId);
  return newId;
};

const SUGGESTED_QUESTIONS = [
  "Comment améliorer mon taux de conversion ?",
  "Analyse mes KPIs actuels",
  "Optimiser mes campagnes Meta Ads",
  "Réduire l'abandon de panier",
];

export const MarketingChatBot = ({ analyticsContext }: MarketingChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Salut ! 👋 Je suis ton assistant marketing. Je peux analyser tes données, t'expliquer tes KPIs et te donner des conseils pour optimiser tes ventes. Pose-moi une question !",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sessionId = useMemo(() => generateSessionId(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: updatedMessages.slice(-10),
          analyticsContext,
          sessionId 
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        toast.error(errorData.error || "Erreur lors de l'envoi");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        toast.error("Pas de réponse du serveur");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg hover:scale-105 transition-all ${
          isOpen ? "hidden" : "flex"
        } items-center gap-2`}
        aria-label="Ouvrir l'assistant marketing"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden md:inline font-medium">Assistant Marketing</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-sm">MarketingGPT</span>
                <p className="text-xs text-muted-foreground">Expert en analyse e-commerce</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content || (isLoading && idx === messages.length - 1 ? (
                    <div className="flex items-center gap-1 py-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show at start) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Questions suggérées :</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-muted/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pose ta question marketing..."
                className="flex-1 px-4 py-2 text-sm bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
