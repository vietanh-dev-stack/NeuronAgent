"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Paperclip } from "lucide-react";
import type { SessionMode } from "@/types";

interface Props {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  mode: SessionMode;
}

const MODE_PLACEHOLDERS: Record<SessionMode, string> = {
  chat: "Ask me anything…",
  code: "Paste code or describe a bug…",
  task: "Describe the task to automate…",
};

export default function ChatInput({ onSend, onStop, isLoading, mode }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSend(text);
    setValue("");
  }, [value, isLoading, onSend]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar">
      <div className="input-container">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={MODE_PLACEHOLDERS[mode]}
          disabled={false}
          rows={1}
          className="chat-textarea"
          aria-label="Chat message input"
        />
        <div className="input-actions">
          <span className="input-hint">⏎ Send · ⇧⏎ Newline</span>
          {isLoading ? (
            <button
              id="stop-btn"
              onClick={onStop}
              className="action-btn stop-btn"
              title="Stop generation"
              aria-label="Stop generation"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={!value.trim()}
              className="action-btn send-btn"
              title="Send message"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
      <p className="input-disclaimer">
        NeuronAgent can make mistakes. Verify important information.
      </p>

      <style jsx>{`
        .input-bar {
          padding: 0.75rem 1.5rem 1.25rem;
          background: var(--bg-base);
          border-top: 1px solid var(--border);
        }

        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .input-container:focus-within {
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08), var(--shadow-glow);
        }

        .chat-textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          padding: 0.875rem 1rem;
          color: var(--text-primary);
          font-size: 15px;
          font-family: var(--font-sans);
          line-height: 1.6;
          resize: none;
          min-height: 52px;
          max-height: 200px;
          overflow-y: auto;
        }

        .chat-textarea::placeholder { color: var(--text-muted); }

        .input-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          flex-shrink: 0;
        }

        .input-hint {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
          flex-shrink: 0;
        }

        .send-btn {
          background: var(--gradient-primary);
          color: white;
        }

        .send-btn:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .stop-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .stop-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .input-disclaimer {
          margin-top: 0.5rem;
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
