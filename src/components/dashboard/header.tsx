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
  Settings
} from "lucide-react";
import { DatacenterSwitcher, useInfra } from "./datacenter-switcher";
import { UserNav } from "./user-nav";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ApprovalCenterDialog } from "./approval-center-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { 
    itemsByRoom,
    approveItem,
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

              <DropdownMenuItem className="cursor-pointer">
                <Settings />
                <span>Configurações do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                        pathname === item.href
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
