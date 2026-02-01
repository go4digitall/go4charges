import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Search, MessageCircle, User, Calendar, RefreshCw, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ConversationGroup {
  session_id: string;
  messages: ChatMessage[];
  first_message_at: string;
  last_message_at: string;
  message_count: number;
}

const AdminChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (dateFilter) {
        const startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
      groupConversations(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupConversations = (msgs: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    
    msgs.forEach((msg) => {
      if (!groups[msg.session_id]) {
        groups[msg.session_id] = [];
      }
      groups[msg.session_id].push(msg);
    });

    const conversationList: ConversationGroup[] = Object.entries(groups).map(
      ([session_id, messages]) => ({
        session_id,
        messages,
        first_message_at: messages[0]?.created_at || "",
        last_message_at: messages[messages.length - 1]?.created_at || "",
        message_count: messages.length,
      })
    );

    conversationList.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    );

    setConversations(conversationList);
  };

  useEffect(() => {
    fetchMessages();
  }, [dateFilter]);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    return conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedConversation = conversations.find(
    (c) => c.session_id === selectedSession
  );

  const exportToCSV = () => {
    const headers = ["Session ID", "Date", "Role", "Message"];
    const rows = messages.map((msg) => [
      msg.session_id,
      format(new Date(msg.created_at), "dd/MM/yyyy HH:mm:ss"),
      msg.role,
      `"${msg.content.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Mobile: show conversation detail
  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSession(null)}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">
                Conversation
              </h2>
              <p className="text-xs text-slate-500">
                {format(new Date(selectedConversation.last_message_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {selectedConversation.message_count} msg
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 pb-20">
          {selectedConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm text-white text-xs font-bold">
                  M
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-white text-slate-800 border border-slate-100"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {format(new Date(msg.created_at), "HH:mm")}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Historique Chat</h1>
                <p className="text-xs text-slate-500">
                  {conversations.length} conv. • {messages.length} msg
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchMessages}
                disabled={loading}
                className="h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={exportToCSV}
                disabled={messages.length === 0}
                className="h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
              />
            </div>
            <Button
              variant={showFilters || dateFilter ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 rounded-xl ${showFilters || dateFilter ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Date filter dropdown */}
          {showFilters && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 h-9 text-sm bg-white"
              />
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter("")}
                  className="h-9 px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Chargement...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-12 w-12 text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">Aucune conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.session_id}
                onClick={() => setSelectedSession(conv.session_id)}
                className="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 line-clamp-2 font-medium">
                      {conv.messages.find((m) => m.role === "user")?.content || "..."}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">
                        {format(new Date(conv.last_message_at), "d MMM 'à' HH:mm", { locale: fr })}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 text-slate-600">
                        {conv.message_count} msg
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
