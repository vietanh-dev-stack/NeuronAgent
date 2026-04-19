"use client";
import type { Session } from "@/types";
import { MessageSquare, Code2, Zap, Menu } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";

const MODE_LABELS: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  chat: { label: "Chat", Icon: MessageSquare, color: "var(--accent-purple)" },
  code: { label: "Code", Icon: Code2, color: "var(--accent-cyan)" },
  task: { label: "Task", Icon: Zap, color: "var(--accent-orange)" },
};

interface Props {
  session?: Session;
}

export default function Header({ session }: Props) {
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);

  const modeInfo = session ? (MODE_LABELS[session.mode] ?? MODE_LABELS.chat) : null;

  return (
    <header className="app-header">
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="menu-btn"
          title="Open sidebar"
          id="header-menu-btn"
        >
          <Menu size={18} />
        </button>
      )}

      <div className="header-center">
        {modeInfo && (
          <div className="mode-badge" style={{ color: modeInfo.color }}>
            <modeInfo.Icon size={14} />
            <span>{modeInfo.label} Mode</span>
          </div>
        )}
        {session && (
          <h1 className="session-name" title={session.title}>
            {session.title.length > 60
              ? session.title.slice(0, 60) + "…"
              : session.title}
          </h1>
        )}
        {!session && <h1 className="session-name">NeuronAgent</h1>}
      </div>

      <div className="header-right">
        {session && (
          <span className="msg-count" title="Messages in this session">
            {session.message_count} msg{session.message_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <style jsx>{`
        .app-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          min-height: 60px;
          flex-shrink: 0;
        }

        .menu-btn {
          background: none;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.4rem;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all var(--transition);
        }

        .menu-btn:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .header-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          overflow: hidden;
        }

        .mode-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          opacity: 0.8;
        }

        .session-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .msg-count {
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.2rem 0.6rem;
          white-space: nowrap;
        }
      `}</style>
    </header>
  );
}
