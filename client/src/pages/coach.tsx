import { useState, useRef, useEffect } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useConversations, useConversation, useCreateConversation, useDeleteConversation } from "@/hooks/use-conversations";
import { useChatStream } from "@/hooks/use-chat-stream"; // We'll implement this hook separately if not generated yet, or use direct logic
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Plus, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// We need to manually implement the chat stream logic here or in a hook since it wasn't in the initial prompt output
// Hook implementation for streaming:
function useChatStreamLocal() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const sendMessage = async (conversationId: number, content: string) => {
    setIsLoading(true);
    // Optimistic update
    const newMsg = { role: 'user' as const, content };
    setMessages(prev => [...prev, newMsg]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error("Failed to send");

      // Handle SSE
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;

      setStreamingContent("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setStreamingContent(prev => prev + data.content);
              }
              if (data.done) {
                 // Finalize
                 setStreamingContent(final => {
                   setMessages(prev => [...prev, { role: 'assistant', content: final }]);
                   return "";
                 });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, setMessages, isLoading, streamingContent, sendMessage };
}

export default function CoachPage() {
  const { user } = useAuth();
  const { data: conversations, refetch: refetchConversations } = useConversations();
  const { mutate: createConversation } = useCreateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const { data: activeConversation } = useConversation(activeConversationId || 0);
  
  const { messages, setMessages, isLoading, streamingContent, sendMessage } = useChatStreamLocal();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messages when active conversation changes
  useEffect(() => {
    if (activeConversation?.messages) {
      setMessages(activeConversation.messages.map(m => ({ 
        role: m.role as 'user'|'assistant', 
        content: m.content 
      })));
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConversationId) return;
    const content = inputValue;
    setInputValue("");
    await sendMessage(activeConversationId, content);
  };

  const handleNewChat = () => {
    createConversation("New Session", {
      onSuccess: (data) => setActiveConversationId(data.id)
    });
  };

  return (
    <LayoutShell>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
        {/* Sidebar */}
        <Card className="col-span-1 border-slate-800 bg-slate-900/40 backdrop-blur flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <Button onClick={handleNewChat} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-2" /> New Session
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations?.map((conv) => (
                <div 
                  key={conv.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors",
                    activeConversationId === conv.id 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="size-4 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-all"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-3 border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col overflow-hidden relative">
          {!activeConversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <Bot className="size-16 mb-4 text-slate-700" />
              <h3 className="text-xl font-medium text-slate-300 mb-2">AI Padel Coach</h3>
              <p className="max-w-md">Select a conversation or start a new one to get tactical advice, analyze your game, or plan your next training session.</p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
              >
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 py-10">
                    <p>Start chatting with your AI coach!</p>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex gap-4 max-w-3xl", 
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "size-8 shrink-0 rounded-full flex items-center justify-center",
                      msg.role === 'user' ? "bg-blue-600" : "bg-indigo-600"
                    )}>
                      {msg.role === 'user' ? <User className="size-5" /> : <Bot className="size-5" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-blue-600/10 text-blue-100 rounded-tr-none border border-blue-500/20" 
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {streamingContent && (
                  <div className="flex gap-4 max-w-3xl mr-auto animate-in">
                    <div className="size-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bot className="size-5" />
                    </div>
                    <div className="p-4 rounded-2xl text-sm leading-relaxed bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700">
                      {streamingContent}
                    </div>
                  </div>
                )}

                {isLoading && !streamingContent && (
                   <div className="flex gap-4 max-w-3xl mr-auto">
                    <div className="size-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bot className="size-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-2">
                      <span className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="size-2 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2 max-w-4xl mx-auto"
                >
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about tactics, technique, or training..."
                    className="bg-slate-800 border-slate-700 text-white focus-visible:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </LayoutShell>
  );
}
