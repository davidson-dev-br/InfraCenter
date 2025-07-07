"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Bell, LayoutGrid, Server, Spline, FileText } from "lucide-react";
import { DatacenterSwitcher, useInfra } from "./datacenter-switcher";
import { UserNav } from "./user-nav";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ApprovalCenterDialog } from "./approval-center-dialog";

export function Header() {
  const pathname = usePathname();
  const { 
    itemsByRoom,
    approveItem,
    buildings,
    selectedBuildingId,
    selectedRoomId,
    setSelectedRoomId 
  } = useInfra();
  
  const allItems = Object.values(itemsByRoom).flat();
  const pendingApprovalCount = allItems.filter(item => item.awaitingApproval).length;
  
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const roomNavItems = selectedBuilding?.rooms || [];

  const otherNavItems = [
    { name: "Equipamentos", href: "/dashboard/admin", icon: Server },
    { name: "Conexões", href: "#", icon: Spline },
    { name: "Relatórios", href: "#", icon: FileText },
  ]

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
            <ApprovalCenterDialog items={allItems} onApproveItem={approveItem}>
              <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5"/>
                  {pendingApprovalCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{pendingApprovalCount}</span>
                  )}
              </Button>
            </ApprovalCenterDialog>
            <UserNav />
        </div>
      </div>
      <Separator />
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 -mb-px">
            {roomNavItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setSelectedRoomId(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                        pathname === '/dashboard' && item.id === selectedRoomId
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    {item.name}
                </button>
            ))}
             {otherNavItems.map((item) => (
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
