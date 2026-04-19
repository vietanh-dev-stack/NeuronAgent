"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  updateSessionTitle: (id: string, title: string) => void;
}

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

type Store = AuthState & SessionState & UIState;

export const useChatStore = create<Store>()(
  persist(
    (set) => ({
      // Auth
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("neuron_token", token);
        }
        set({ token, user });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("neuron_token");
        }
        set({ token: null, user: null, sessions: [], activeSessionId: null });
      },

      // Sessions
      sessions: [],
      activeSessionId: null,
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),
      removeSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((x) => x.id !== id),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        })),
      setActiveSession: (id) => set({ activeSessionId: id }),
      updateSessionTitle: (id, title) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, title } : x)),
        })),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "neuron-store",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
