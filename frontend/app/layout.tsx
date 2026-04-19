import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuronAgent — Personal AI Assistant",
  description:
    "A powerful personal AI agent for coding, learning, task automation, and productivity.",
  keywords: ["AI", "assistant", "coding", "productivity", "chat"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
