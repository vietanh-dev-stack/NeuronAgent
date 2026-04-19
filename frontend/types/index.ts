// Shared TypeScript types for NeuronAgent frontend

export type MessageRole = "user" | "assistant" | "tool";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolOutput?: string;
  createdAt?: string;
  isStreaming?: boolean;
}

export interface Session {
  id: string;
  title: string;
  mode: "chat" | "code" | "task";
  message_count: number;
  created_at: string;
  last_message_at: string;
}

export type SessionMode = "chat" | "code" | "task";

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

// SSE Event types from backend
export type SSEEventType = "text_delta" | "tool_call" | "tool_result" | "done" | "error";

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  tool?: string;
  input?: Record<string, unknown>;
  output?: string;
  usage?: { input_tokens: number; output_tokens: number };
  message?: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  category: string;
  created_at: string;
}

export interface MemoryResponse {
  short_term: Array<{ role: string; content: string }>;
  long_term: MemoryEntry[];
}
