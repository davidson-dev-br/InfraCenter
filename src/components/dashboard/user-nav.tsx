
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Eye, EyeOff } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { useInfra } from "./datacenter-switcher";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ProfileDialog } from "./profile-dialog";
import type { UserRole } from "@/lib/types";

// Helper to capitalize role names for display
const formatRoleName = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
};


export function UserNav() {
  const router = useRouter();
  const { userData, realUserData, impersonatedRole, setImpersonatedRole } = useAuth();
  const { systemSettings } = useInfra();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      if (!auth) throw new Error("Firebase não configurado.");
      await signOut(auth);
      router.push("/");
      toast({ title: "Você foi desconectado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao sair", description: "Não foi possível desconectar. Tente novamente."})
    }
  };

  const getInitials = (name: string = '') => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  const isDeveloper = realUserData?.role === 'developer';
  const availableRoles = systemSettings.userRoles.filter(r => r.name !== 'developer').map(r => r.name as UserRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-10 h-10 rounded-full">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userData?.avatarUrl || ''} alt={userData?.name || 'User avatar'} />
            <AvatarFallback>{getInitials(userData?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.name || 'Carregando...'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData?.email || ''}
            </p>
             {impersonatedRole && (
                <p className="text-xs leading-none text-yellow-600 font-semibold pt-1">
                  (Visualizando como {formatRoleName(impersonatedRole)})
                </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ProfileDialog>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </ProfileDialog>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/settings">
              <Settings className="w-4 h-4 mr-2" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {isDeveloper && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Eye className="w-4 h-4 mr-2" />
                <span>Ver como...</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {availableRoles.map(role => (
                     <DropdownMenuItem key={role} onSelect={() => setImpersonatedRole(role)} className="cursor-pointer">
                        <span>{formatRoleName(role)}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onSelect={() => setImpersonatedRole(null)} disabled={!impersonatedRole} className="cursor-pointer">
                      <EyeOff className="w-4 h-4 mr-2" />
                      <span>Restaurar Visão</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
