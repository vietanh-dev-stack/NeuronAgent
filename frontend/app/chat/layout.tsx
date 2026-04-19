"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useSessions } from "@/hooks/useSessions";
import Sidebar from "@/components/layout/Sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useChatStore((s) => s.token);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  useSessions(); // preload sessions

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="chat-shell">
      <Sidebar />
      <main className={`chat-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {children}
      </main>

      <style jsx>{`
        .chat-shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-base);
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: margin-left var(--transition-slow);
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
