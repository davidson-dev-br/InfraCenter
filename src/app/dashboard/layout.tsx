import type { ReactNode } from "react";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
