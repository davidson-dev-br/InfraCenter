import type { ReactNode } from "react";
import { Header } from "@/components/dashboard/header";
import { InfraProvider } from "@/components/dashboard/datacenter-switcher";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <InfraProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </InfraProvider>
  );
}
