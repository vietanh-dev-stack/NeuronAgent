/**
 * Typed API client for NeuronAgent backend.
 * All requests include JWT from localStorage.
 */
import type { AuthToken, Session, MemoryResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API = `${BASE_URL}/api/v1`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neuron_token");
}

function headers(extra: Record<string, string> = {}): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: headers(opts.headers as Record<string, string>),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, username: string, password: string) =>
    request<AuthToken>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Sessions ─────────────────────────────────────────────────────────
export const sessionApi = {
  list: () => request<Session[]>("/sessions"),

  create: (mode: string = "chat") =>
    request<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  rename: (id: string, title: string) =>
    request<{ ok: boolean }>(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  delete: (id: string) =>
    fetch(`${API}/sessions/${id}`, {
      method: "DELETE",
      headers: headers(),
    }),

  getHistory: (sessionId: string) =>
    request<
      Array<{
        id: string;
        role: string;
        content: string;
        tool_name?: string;
        created_at: string;
      }>
    >(`/chat/history/${sessionId}`),
};

// ─── Memory ───────────────────────────────────────────────────────────
export const memoryApi = {
  get: (sessionId: string) =>
    request<MemoryResponse>(`/memory?session_id=${sessionId}`),
};

// ─── Chat Streaming ───────────────────────────────────────────────────
export const BASE = BASE_URL;
export const API_PREFIX = "/api/v1";
