"use client";
import { useState, useCallback, useRef } from "react";
import type { ChatMessage, SSEEvent, SessionMode } from "@/types";
import { streamChat } from "@/lib/stream";

interface UseChatOptions {
  sessionId: string;
  mode?: SessionMode;
}

export function useChat({ sessionId, mode = "chat" }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateAssistantMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setError(null);

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMsg);

      // Create streaming assistant placeholder
      const assistantId = crypto.randomUUID();
      assistantIdRef.current = assistantId;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
        createdAt: new Date().toISOString(),
      };
      addMessage(assistantMsg);
      setIsLoading(true);

      const controller = streamChat(
        sessionId,
        text,
        mode,
        (event: SSEEvent) => {
          const aid = assistantIdRef.current!;
          if (event.type === "text_delta" && event.content) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aid ? { ...m, content: m.content + event.content } : m
              )
            );
          } else if (event.type === "tool_call") {
            const toolMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "tool",
              content: `🔧 Calling **${event.tool}**...`,
              toolName: event.tool,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => {
              // Insert before the streaming assistant message
              const idx = prev.findIndex((m) => m.id === aid);
              const next = [...prev];
              next.splice(idx, 0, toolMsg);
              return next;
            });
          } else if (event.type === "tool_result") {
            setMessages((prev) =>
              prev.map((m) =>
                m.toolName === event.tool && m.role === "tool"
                  ? { ...m, content: `🔧 **${event.tool}** result ready`, toolOutput: event.output }
                  : m
              )
            );
          } else if (event.type === "error") {
            setError(event.message ?? "An error occurred");
            updateAssistantMessage(aid, { isStreaming: false });
          }
        },
        () => {
          // onDone
          const aid = assistantIdRef.current!;
          setMessages((prev) =>
            prev.map((m) => (m.id === aid ? { ...m, isStreaming: false } : m))
          );
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          if (assistantIdRef.current) {
            updateAssistantMessage(assistantIdRef.current, { isStreaming: false });
          }
        }
      );

      abortRef.current = controller;
    },
    [sessionId, mode, isLoading, addMessage, updateAssistantMessage]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    if (assistantIdRef.current) {
      updateAssistantMessage(assistantIdRef.current, { isStreaming: false });
    }
  }, [updateAssistantMessage]);

  const clearMessages = useCallback(() => setMessages([]), []);
  
  const loadMessages = useCallback((msgs: ChatMessage[]) => setMessages(msgs), []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    loadMessages,
  };
}
