export default function TypingIndicator() {
  return (
    <div className="typing-wrap">
      <div className="typing-avatar">
        <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" stroke="url(#ti)" strokeWidth="2"/>
          <circle cx="16" cy="16" r="3" fill="url(#ti)"/>
          <defs>
            <linearGradient id="ti" x1="0" y1="0" x2="32" y2="32">
              <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#3b82f6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="typing-bubble">
        <span className="dot" style={{ animationDelay: "0ms" }} />
        <span className="dot" style={{ animationDelay: "150ms" }} />
        <span className="dot" style={{ animationDelay: "300ms" }} />
      </div>

      <style jsx>{`
        .typing-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          align-self: flex-start;
          animation: fadeIn 0.2s ease;
        }

        .typing-avatar {
          width: 32px; height: 32px;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .typing-bubble {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
          padding: 0.875rem 1.125rem;
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .dot {
          width: 7px; height: 7px;
          background: var(--text-muted);
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
