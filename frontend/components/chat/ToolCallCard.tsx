"use client";
import { useState } from "react";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

export default function ToolCallCard({ message }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasOutput = !!message.toolOutput;

  return (
    <div className="tool-card">
      <button
        className="tool-header"
        onClick={() => hasOutput && setExpanded((e) => !e)}
        aria-expanded={expanded}
        id={`tool-${message.id}`}
      >
        <span className="tool-icon">🔧</span>
        <span className="tool-name">
          {message.toolName ?? "tool"}
        </span>
        {hasOutput && (
          <span className="tool-status success">✓ Done</span>
        )}
        {!hasOutput && (
          <span className="tool-status running">
            <span className="spinner-xs" /> Running…
          </span>
        )}
        {hasOutput && (
          <span className="tool-toggle">{expanded ? "▲" : "▼"}</span>
        )}
      </button>

      {expanded && message.toolOutput && (
        <div className="tool-output">
          <div className="prose">
            <pre>{message.toolOutput}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .tool-card {
          align-self: flex-start;
          max-width: 70%;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          overflow: hidden;
          animation: fadeIn 0.2s ease;
          font-size: 13px;
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.875rem;
          width: 100%;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
        }

        .tool-header:hover { background: rgba(255,255,255,0.02); }

        .tool-icon { font-size: 14px; }

        .tool-name {
          font-weight: 600;
          font-family: var(--font-mono);
          color: #6ee7b7;
          flex: 1;
        }

        .tool-status {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: var(--radius-full);
          padding: 0.15rem 0.5rem;
        }

        .tool-status.success {
          color: var(--accent-green);
          background: rgba(16, 185, 129, 0.1);
        }

        .tool-status.running {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.1);
        }

        .spinner-xs {
          width: 10px; height: 10px;
          border: 1.5px solid rgba(245,158,11,0.3);
          border-top-color: var(--accent-orange);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        .tool-toggle { color: var(--text-muted); }

        .tool-output {
          border-top: 1px solid rgba(16, 185, 129, 0.15);
          padding: 0.75rem 0.875rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .tool-output pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
