import type { ReactNode } from "react";
import { Header } from "@/components/dashboard/header";
import { DatacenterProvider } from "@/components/dashboard/datacenter-switcher";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DatacenterProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </DatacenterProvider>
  );
}
