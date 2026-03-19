import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { getAppState } from "@/lib/server/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green2B Studio",
  description: "Internal market research and sustainability scoring prototype for Green2B.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appState = await getAppState();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppShell activeRole={appState.activeRole}>{children}</AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
