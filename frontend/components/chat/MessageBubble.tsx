"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ChatMessage } from "@/types";
import ToolCallCard from "./ToolCallCard";
import { useChatStore } from "@/stores/chatStore";

interface Props {
  message: ChatMessage;
  isLast: boolean;
}

export default function MessageBubble({ message }: Props) {
  const user = useChatStore((s) => s.user);
  const isUser = message.role === "user";
  const isTool = message.role === "tool";

  if (isTool) {
    return <ToolCallCard message={message} />;
  }

  return (
    <div className={`bubble-wrap ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="avatar assistant-avatar" aria-label="NeuronAgent">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="url(#b)" strokeWidth="2" />
            <path d="M10 16C10 12.686 12.686 10 16 10s6 2.686 6 6-2.686 6-6 6"
              stroke="url(#b)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="url(#b)" />
            <defs>
              <linearGradient id="b" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      <div className={`bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
        {isUser ? (
          <p className="user-text">{message.content}</p>
        ) : (
          <div className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content || ""}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="cursor-blink" aria-hidden="true">▋</span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar" aria-label="You">
          {user?.username?.charAt(0).toUpperCase() ?? "U"}
        </div>
      )}

      <style jsx>{`
        .bubble-wrap {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          max-width: 85%;
          animation: fadeIn 0.2s ease;
        }

        .bubble-wrap.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .bubble-wrap.assistant {
          align-self: flex-start;
        }

        .avatar {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .assistant-avatar {
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.25);
        }

        .user-avatar {
          background: var(--gradient-primary);
          color: white;
          font-size: 14px;
        }

        .bubble {
          border-radius: var(--radius-lg);
          padding: 0.875rem 1.125rem;
          max-width: 100%;
          line-height: 1.65;
        }

        .bubble-user {
          background: var(--gradient-primary);
          color: white;
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
        }

        .user-text {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .bubble-assistant {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
          color: var(--text-primary);
        }

        .cursor-blink {
          display: inline-block;
          color: var(--accent-purple);
          animation: blink 0.8s step-end infinite;
          font-weight: 300;
        }
      `}</style>
    </div>
  );
}
