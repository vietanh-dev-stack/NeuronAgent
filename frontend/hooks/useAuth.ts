"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { authApi } from "@/lib/api";

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useChatStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      setAuth(data.access_token, data.user);
      router.push("/chat");
    },
    [setAuth, router]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const data = await authApi.register(email, username, password);
      setAuth(data.access_token, data.user);
      router.push("/chat");
    },
    [setAuth, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  return { token, user, isAuthenticated: !!token, login, register, logout };
}
