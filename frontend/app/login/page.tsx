"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="url(#grad)" strokeWidth="2"/>
              <path d="M10 16C10 12.686 12.686 10 16 10s6 2.686 6 6-2.686 6-6 6" 
                    stroke="url(#grad)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="3" fill="url(#grad)"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6"/>
                  <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">NeuronAgent</h1>
          <p className="auth-subtitle">Sign in to your AI assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-link">Create one</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-base);
          background-image: radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
          padding: 1.5rem;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          animation: fadeIn 0.4s ease;
        }

        .auth-brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.4rem;
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-size: 15px;
          font-family: var(--font-sans);
          transition: border-color var(--transition);
          width: 100%;
        }

        .form-input::placeholder { color: var(--text-muted); }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          padding: 0.85rem 1.5rem;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity var(--transition), transform var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 48px;
        }

        .btn-primary:not(:disabled):hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
        }

        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--accent-purple);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
