import Link from "next/link";
import { Building2 } from "lucide-react";
import { DatacenterSwitcher } from "./datacenter-switcher";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex items-center h-16 px-4 mx-auto sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6 text-foreground">
          <Building2 className="w-6 h-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline">
            InfraCenter Manager
          </span>
        </Link>
        <DatacenterSwitcher />
        <div className="flex items-center gap-4 ml-auto">
           <Link href="/dashboard/admin" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Datacenter Admin
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
