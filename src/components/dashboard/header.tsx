"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutGrid, 
  Server, 
  Spline, 
  FileText,
  SlidersHorizontal,
  ClipboardCheck,
  History,
  Users,
  ClipboardX,
  Building,
  Settings,
  Code
} from "lucide-react";
import { DatacenterSwitcher, useInfra } from "./datacenter-switcher";
import { UserNav } from "./user-nav";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ApprovalCenterDialog } from "./approval-center-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { 
    itemsByRoom,
    approveItem
  } = useInfra();
  
  const allItems = Object.values(itemsByRoom).flat();
  const pendingApprovalCount = allItems.filter(item => item.awaitingApproval).length;
  
  const navItems = [
    { name: "Planta Baixa", href: "/dashboard", icon: LayoutGrid },
    { name: "Equipamentos", href: "/dashboard/admin", icon: Server },
    { name: "Conexões", href: "#", icon: Spline },
    { name: "Relatórios", href: "#", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-sm">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center h-16">
          <div className="flex items-center gap-2 mr-auto">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold sm:inline-block font-headline">
                  InfraCenter Manager
              </span>
              <Badge variant="secondary">v3.2.6</Badge>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <span className="hidden text-sm font-medium sm:inline text-muted-foreground">Prédio:</span>
                  <DatacenterSwitcher />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <SlidersHorizontal className="w-5 h-5" />
                    {pendingApprovalCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex w-full h-full bg-red-500 rounded-full opacity-75 animate-ping"></span>
                        <span className="relative inline-flex w-2.5 h-2.5 bg-red-600 rounded-full"></span>
                      </span>
                    )}
                    <span className="sr-only">Abrir menu de gerenciamento</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                    <ApprovalCenterDialog items={allItems} onApproveItem={approveItem}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                        <ClipboardCheck />
                        <span>Centro de Aprovações</span>
                        {pendingApprovalCount > 0 && (
                          <Badge variant="default" className="ml-auto">{pendingApprovalCount}</Badge>
                        )}
                      </DropdownMenuItem>
                    </ApprovalCenterDialog>

                  <DropdownMenuItem className="cursor-pointer">
                    <History />
                    <span>Log de Atividades</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer">
                    <Users />
                    <span>Gerenciar Usuários</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer">
                    <ClipboardX />
                    <span>Log de Exclusões</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/admin">
                      <Building />
                      <span>Gerenciar Datacenters</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/settings">
                      <Settings />
                      <span>Configurações do Sistema</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/developer">
                      <Code />
                      <span>Opções do Desenvolvedor</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserNav />
          </div>
        </div>

        {/* Bottom row - Navigation */}
        <nav className="flex items-center h-12 gap-6 border-t">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    data-state={pathname === item.href ? 'active' : 'inactive'}
                    className={cn(
                        "flex items-center gap-2 text-base font-medium transition-colors h-full",
                        "text-muted-foreground hover:text-primary",
                        "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    )}
                >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
