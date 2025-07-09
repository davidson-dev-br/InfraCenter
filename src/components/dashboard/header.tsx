
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
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
  Code,
  Loader2,
  EyeOff,
  BrainCircuit
} from "lucide-react";
import { DatacenterSwitcher, useInfra } from "./datacenter-switcher";
import { useAuth } from "./auth-provider";
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

// Helper to capitalize role names for display
const formatRoleName = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
};


export function Header() {
  const pathname = usePathname();
  const { 
    itemsByRoom,
    approveItem,
    systemSettings,
    approveDeletion,
    rejectDeletion,
  } = useInfra();
  const { userData, realUserData, impersonation } = useAuth();
  
  const [isNavigatingTo, setIsNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    // When navigation completes, pathname changes, and we can stop the spinner.
    setIsNavigatingTo(null);
  }, [pathname]);

  const allItems = Object.values(itemsByRoom).flat();
  const pendingApprovalCount = allItems.filter(item => item.awaitingApproval).length;
  const pendingDeletionCount = allItems.filter(item => item.awaitingDeletionApproval).length;
  
  const navItems = [
    { name: "Planta Baixa", href: "/dashboard", icon: LayoutGrid },
    { name: "Equipamentos", href: "/dashboard/equipamentos", icon: Server },
    { name: "Conexões", href: "/dashboard/connections", icon: Spline },
    { name: "Relatórios", href: "/dashboard/reports", icon: FileText },
  ];

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
        setIsNavigatingTo(href);
    }
  };

  const renderIcon = (href: string, Icon: React.ElementType) => {
      if (isNavigatingTo === href) {
          return <Loader2 className="w-5 h-5 animate-spin" />;
      }
      return <Icon className="w-5 h-5" />;
  }

  const permissions = userData?.role ? systemSettings.rolePermissions[userData.role] : null;
  const isDeveloper = realUserData?.role === 'developer';

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-sm">
      {isDeveloper && impersonation?.role && (
          <div className="flex items-center justify-center w-full gap-4 py-1 text-sm font-semibold text-center text-black bg-yellow-400">
              <EyeOff className="w-4 h-4" />
              Visualizando como: {formatRoleName(impersonation.role)}
          </div>
      )}
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

              {(isDeveloper || permissions?.canSeeManagementMenu) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <SlidersHorizontal className="w-5 h-5" />
                      {(pendingApprovalCount + pendingDeletionCount) > 0 && (
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
                    
                      {(isDeveloper || permissions.canAccessApprovalCenter) && (
                        <ApprovalCenterDialog 
                          items={allItems} 
                          onApproveItem={approveItem}
                          onApproveDeletion={approveDeletion}
                          onRejectDeletion={rejectDeletion}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <ClipboardCheck />
                            <span>Centro de Aprovações</span>
                            {(pendingApprovalCount + pendingDeletionCount) > 0 && (
                              <Badge variant="default" className="ml-auto">{pendingApprovalCount + pendingDeletionCount}</Badge>
                            )}
                          </DropdownMenuItem>
                        </ApprovalCenterDialog>
                      )}

                    {(isDeveloper || permissions.canAccessActivityLog) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/activity-log" onClick={() => handleNavClick('/dashboard/activity-log')}>
                          {renderIcon('/dashboard/activity-log', History)}
                          <span>Log de Atividades</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {(isDeveloper || permissions.canManageUsers) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/users" onClick={() => handleNavClick('/dashboard/users')}>
                            {renderIcon('/dashboard/users', Users)}
                            <span>Gerenciar Usuários</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {(isDeveloper || permissions.canAccessDeletionLog) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/deletion-log" onClick={() => handleNavClick('/dashboard/deletion-log')}>
                            {renderIcon('/dashboard/deletion-log', ClipboardX)}
                            <span>Log de Exclusões</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {(isDeveloper || permissions.canManageDatacenters || permissions.canAccessSystemSettings) && <DropdownMenuSeparator />}

                    {(isDeveloper || permissions.canManageDatacenters) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/admin" onClick={() => handleNavClick('/dashboard/admin')}>
                          {renderIcon('/dashboard/admin', Building)}
                          <span>Gerenciar Datacenters</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {(isDeveloper || permissions.canAccessSystemSettings) && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/settings" onClick={() => handleNavClick('/dashboard/settings')}>
                          {renderIcon('/dashboard/settings', Settings)}
                          <span>Configurações do Sistema</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {isDeveloper && (
                      <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/learning-machine" onClick={() => handleNavClick('/dashboard/learning-machine')}>
                          {renderIcon('/dashboard/learning-machine', BrainCircuit)}
                          <span>Treinamento de IA</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/developer" onClick={() => handleNavClick('/dashboard/developer')}>
                          {renderIcon('/dashboard/developer', Code)}
                          <span>Opções do Desenvolvedor</span>
                        </Link>
                      </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <UserNav />
          </div>
        </div>

        {/* Bottom row - Navigation */}
        <nav className="flex items-center h-12 gap-6 border-t">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    data-state={pathname === item.href ? 'active' : 'inactive'}
                    className={cn(
                        "flex items-center gap-2 text-base font-medium transition-colors h-full",
                        "text-muted-foreground hover:text-primary",
                        "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    )}
                >
                    {renderIcon(item.href, item.icon)}
                    <span>{item.name}</span>
                </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
