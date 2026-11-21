import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <InstallPrompt />
    </AppShell>
  );
}
