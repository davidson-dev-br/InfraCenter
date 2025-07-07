import Link from "next/link";
import { Building2, Filter, LayoutGrid, Server, Spline, FileText } from "lucide-react";
import { DatacenterSwitcher } from "./datacenter-switcher";
import { UserNav } from "./user-nav";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const navItems = [
    { name: "Planta Baixa", href: "/dashboard", icon: LayoutGrid, current: true },
    { name: "Equipamentos", href: "/dashboard/admin", icon: Server, current: false },
    { name: "Conexões", href: "#", icon: Spline, current: false },
    { name: "Relatórios", href: "#", icon: FileText, current: false },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex items-center h-16 px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mr-4">
            <Building2 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold sm:inline-block font-headline">
                TIM BLMSAC
            </span>
            <Badge variant="secondary">v3.2.6</Badge>
        </div>
        
        <DatacenterSwitcher />

        <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
                <Filter className="w-5 h-5"/>
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">4</span>
            </Button>
            <UserNav />
        </div>
      </div>
      <Separator />
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 -mb-px">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                        item.current
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
