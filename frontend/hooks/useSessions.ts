"use client";
import { useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { sessionApi } from "@/lib/api";

export function useSessions() {
  const { sessions, setSessions, addSession, removeSession, updateSessionTitle } =
    useChatStore();

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionApi.list();
      setSessions(data);
    } catch {
      // Not authenticated yet — silent fail
    }
  }, [setSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = useCallback(
    async (mode = "chat") => {
      const session = await sessionApi.create(mode);
      addSession(session);
      return session;
    },
    [addSession]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await sessionApi.delete(id);
      removeSession(id);
    },
    [removeSession]
  );

  const renameSession = useCallback(
    async (id: string, title: string) => {
      await sessionApi.rename(id, title);
      updateSessionTitle(id, title);
    },
    [updateSessionTitle]
  );

  return { sessions, loadSessions, createSession, deleteSession, renameSession };
}
