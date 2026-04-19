import type { SSEEvent, ChatMessage } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neuron_token");
}

/**
 * Open an SSE stream to the chat endpoint.
 * Calls onEvent for each parsed SSE event.
 * Calls onDone when the stream completes.
 * Returns an AbortController to cancel the stream.
 */
export function streamChat(
  sessionId: string,
  message: string,
  mode: string,
  onEvent: (event: SSEEvent) => void,
  onDone: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  const token = getToken();

  fetch(`${BASE_URL}/api/v1/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ session_id: sessionId, message, mode }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        throw new Error(`Stream failed: HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (!payload) continue;
            try {
              const event: SSEEvent = JSON.parse(payload);
              onEvent(event);
              if (event.type === "done") {
                onDone();
              }
            } catch {
              // ignore malformed events
            }
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(err);
      }
    });

  return controller;
}
