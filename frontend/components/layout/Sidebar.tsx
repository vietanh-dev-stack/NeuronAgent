"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Code2, Zap, Plus, Trash2, LogOut, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import type { Session } from "@/types";
import { truncate, formatDate } from "@/lib/utils";

const MODE_ICONS = {
  chat: MessageSquare,
  code: Code2,
  task: Zap,
};

export default function Sidebar() {
  const { sessions, createSession, deleteSession } = useSessions();
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  const user = useChatStore((s) => s.user);
  const { logout } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleNew = async () => {
    setCreating(true);
    try {
      const s = await createSession("chat");
      router.push(`/chat/${s.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteSession(id);
    if (activeSessionId === id) router.push("/chat");
  };

  return (
    <>
      {/* Collapsed toggle button */}
      {!sidebarOpen && (
        <button
          className="sidebar-expand-btn"
          onClick={toggleSidebar}
          title="Open sidebar"
          id="sidebar-expand"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Bot size={20} className="brand-icon" />
            {sidebarOpen && <span className="brand-name">NeuronAgent</span>}
          </div>
          <button
            onClick={toggleSidebar}
            className="collapse-btn"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            id="sidebar-toggle"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* New Chat button */}
        <button
          id="new-chat-btn"
          onClick={handleNew}
          disabled={creating}
          className={`new-chat-btn ${sidebarOpen ? "" : "icon-only"}`}
          title="New chat"
        >
          <Plus size={16} />
          {sidebarOpen && <span>{creating ? "Creating…" : "New Chat"}</span>}
        </button>

        {/* Session list */}
        {sidebarOpen && (
          <div className="session-list">
            {sessions.length === 0 && (
              <p className="no-sessions">No conversations yet</p>
            )}
            {sessions.map((s: Session) => {
              const Icon = MODE_ICONS[s.mode] ?? MessageSquare;
              const isActive = s.id === activeSessionId;
              return (
                <Link
                  key={s.id}
                  href={`/chat/${s.id}`}
                  className={`session-item ${isActive ? "active" : ""}`}
                  id={`session-${s.id}`}
                >
                  <Icon size={14} className="session-icon" />
                  <div className="session-body">
                    <span className="session-title">{truncate(s.title, 32)}</span>
                    <span className="session-date">{formatDate(s.last_message_at)}</span>
                  </div>
                  <button
                    className="session-delete"
                    onClick={(e) => handleDelete(e, s.id)}
                    title="Delete session"
                    aria-label={`Delete session ${s.title}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </Link>
              );
            })}
          </div>
        )}

        {/* User footer */}
        <div className={`sidebar-footer ${sidebarOpen ? "" : "icon-only"}`}>
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="user-meta">
                <span className="user-name">{user?.username}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={logout}
            className="logout-btn"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-expand-btn {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 40;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-left: none;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          padding: 0.5rem 0.4rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }

        .sidebar-expand-btn:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          transition: width var(--transition-slow);
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar.open  { width: 260px; }
        .sidebar.closed { width: 0; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          min-height: 60px;
          flex-shrink: 0;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          overflow: hidden;
        }

        .brand-icon {
          color: var(--accent-purple);
          flex-shrink: 0;
        }

        .brand-name {
          font-weight: 700;
          font-size: 16px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        .collapse-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: color var(--transition);
          flex-shrink: 0;
        }

        .collapse-btn:hover { color: var(--text-primary); }

        .new-chat-btn {
          margin: 0.75rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: var(--radius-md);
          padding: 0.65rem 1rem;
          color: var(--accent-purple);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .new-chat-btn.icon-only {
          padding: 0.65rem;
          justify-content: center;
        }

        .new-chat-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .new-chat-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .session-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.25rem 0.5rem;
        }

        .no-sessions {
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          padding: 2rem 1rem;
        }

        .session-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          transition: all var(--transition);
          min-height: 52px;
          position: relative;
        }

        .session-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .session-item:hover .session-delete { opacity: 1; }
        .session-item.active {
          background: rgba(139, 92, 246, 0.1);
          color: var(--text-primary);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .session-icon { flex-shrink: 0; color: var(--text-muted); }
        .session-item.active .session-icon { color: var(--accent-purple); }

        .session-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          overflow: hidden;
        }

        .session-title {
          font-size: 13.5px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .session-date {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .session-delete {
          opacity: 0;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition);
          flex-shrink: 0;
        }

        .session-delete:hover { color: var(--accent-red); }

        .sidebar-footer {
          border-top: 1px solid var(--border);
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .sidebar-footer.icon-only { justify-content: center; }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex: 1;
          overflow: hidden;
        }

        .user-avatar {
          width: 30px; height: 30px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          background: none;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.4rem;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all var(--transition);
          flex-shrink: 0;
        }

        .logout-btn:hover {
          color: var(--accent-red);
          border-color: rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08);
        }
      `}</style>
    </>
  );
}
