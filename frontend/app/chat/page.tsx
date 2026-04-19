"use client";
import { useChatStore } from "@/stores/chatStore";
import { useSessions } from "@/hooks/useSessions";
import { useRouter } from "next/navigation";
import { Bot, MessageSquare, Code2, Zap } from "lucide-react";

const modes = [
  { id: "chat", icon: MessageSquare, label: "Chat", desc: "General conversation & knowledge" },
  { id: "code", icon: Code2, label: "Code", desc: "Debug, explain & optimize code" },
  { id: "task", icon: Zap, label: "Task", desc: "Automate workflows with tools" },
];

export default function ChatPage() {
  const user = useChatStore((s) => s.user);
  const { createSession } = useSessions();
  const router = useRouter();

  const handleStart = async (mode: string) => {
    const session = await createSession(mode);
    router.push(`/chat/${session.id}`);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <Bot size={40} strokeWidth={1.5} />
        </div>
        <h1 className="welcome-title">
          Hello{user ? `, ${user.username}` : ""}! 👋
        </h1>
        <p className="welcome-sub">
          Choose how you&apos;d like to start a new conversation with NeuronAgent.
        </p>

        <div className="mode-grid">
          {modes.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              id={`start-${id}`}
              className="mode-card"
              onClick={() => handleStart(id)}
            >
              <div className="mode-icon">
                <Icon size={22} />
              </div>
              <div className="mode-body">
                <span className="mode-label">{label}</span>
                <span className="mode-desc">{desc}</span>
              </div>
              <div className="mode-arrow">→</div>
            </button>
          ))}
        </div>

        <div className="welcome-tips">
          <p className="tip-title">💡 Things you can ask me</p>
          <div className="tip-chips">
            {[
              "Explain this Python code",
              "Debug my JavaScript",
              "Calculate 15% of 3,750",
              "Search for React best practices",
              "Take a note about my project",
            ].map((tip) => (
              <span key={tip} className="tip-chip">{tip}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .welcome-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow-y: auto;
        }

        .welcome-content {
          max-width: 600px;
          width: 100%;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .welcome-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 50%;
          color: var(--accent-purple);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .welcome-icon::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 340deg, rgba(139, 92, 246, 0.3) 360deg);
          animation: spin 3s linear infinite;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .welcome-sub {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }

        .mode-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .mode-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition);
          color: var(--text-primary);
        }

        .mode-card:hover {
          border-color: var(--border-accent);
          background: var(--bg-elevated);
          transform: translateX(4px);
          box-shadow: var(--shadow-glow);
        }

        .mode-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-md);
          color: var(--accent-purple);
        }

        .mode-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mode-label {
          font-weight: 600;
          font-size: 15px;
        }

        .mode-desc {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .mode-arrow {
          color: var(--text-muted);
          font-size: 18px;
          transition: color var(--transition), transform var(--transition);
        }

        .mode-card:hover .mode-arrow {
          color: var(--accent-purple);
          transform: translateX(4px);
        }

        .welcome-tips {
          text-align: left;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
        }

        .tip-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .tip-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tip-chip {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.3rem 0.75rem;
          font-size: 13px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
