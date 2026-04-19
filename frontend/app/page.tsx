"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";

export default function RootPage() {
  const router = useRouter();
  const token = useChatStore((s) => s.token);

  useEffect(() => {
    if (token) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return null;
}