"use client";
import { useEffect, use } from "react";
import { sessionApi } from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import Header from "@/components/layout/Header";
import { useChatStore } from "@/stores/chatStore";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: Props) {
  const { sessionId } = use(params);
  const sessions = useChatStore((s) => s.sessions);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  
  const session = sessions.find((s) => s.id === sessionId);
  const { messages, isLoading, error, sendMessage, stopGeneration, loadMessages } =
    useChat({ sessionId, mode: session?.mode ?? "chat" });

  // Set active session
  useEffect(() => {
    setActiveSession(sessionId);
    return () => setActiveSession(null);
  }, [sessionId, setActiveSession]);

  // Load conversation history
  useEffect(() => {
    sessionApi.getHistory(sessionId).then((history) => {
      const msgs = history.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "tool",
        content: m.content,
        toolName: m.tool_name ?? undefined,
        createdAt: m.created_at,
        isStreaming: false,
      }));
      loadMessages(msgs);
    }).catch(() => {/* session may be new */});
  }, [sessionId, loadMessages]);

  return (
    <div className="session-layout">
      <Header session={session} />
      <ChatWindow messages={messages} isLoading={isLoading} />
      {error && (
        <div className="chat-error">
          ⚠️ {error}
        </div>
      )}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
        mode={session?.mode ?? "chat"}
      />

      <style jsx>{`
        .session-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-error {
          margin: 0 1rem 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-radius: var(--radius-md);
          padding: 0.6rem 1rem;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
