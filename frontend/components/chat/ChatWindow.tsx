"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-window">
      {!hasMessages && (
        <div className="empty-state">
          <span className="empty-icon">💬</span>
          <p>Start the conversation — ask anything!</p>
        </div>
      )}

      {messages.map((msg, idx) => (
        <MessageBubble key={msg.id} message={msg} isLast={idx === messages.length - 1} />
      ))}

      {isLoading && messages.every((m) => !m.isStreaming) && (
        <TypingIndicator />
      )}

      <div ref={bottomRef} />

      <style jsx>{`
        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          scroll-behavior: smooth;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 15px;
          height: 100%;
        }

        .empty-icon {
          font-size: 2.5rem;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
