
"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import {
  Server,
  LogOut,
  Users,
  ShieldCheck,
  Building,
  Settings,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from './ui/dropdown-menu';
import { usePermissions, USER_ROLES } from './permissions-provider';
import type { UserRole } from './permissions-provider';
import { useBuilding } from './building-provider';
import { NAV_SECTIONS } from '@/lib/menu-config';
import { useKonamiCode } from '@/hooks/use-konami-code';
import { DeveloperMenu } from './developer-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NoAccessPage = () => {
    const router = useRouter();
    const handleLogout = async () => {
        const auth = getAuth(app);
        await signOut(auth);
        router.push('/login');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                       <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle>Acesso Limitado</CardTitle>
                    <CardDescription>
                        Sua conta está ativa, mas você ainda não tem permissão para acessar nenhum prédio ou sala.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Por favor, entre em contato com um administrador do sistema para solicitar a liberação do seu acesso.
                    </p>
                </CardContent>
                <CardContent>
                     <Button onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const { user: dbUser, realRole, viewAs, setViewAsRole, isDeveloper, hasPermission } = usePermissions();
  const { buildings, activeBuildingId, setActiveBuildingId } = useBuilding();
  
  const showDeveloperMenu = useKonamiCode();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const hiddenMenuItems = dbUser?.preferences?.hiddenMenuItems || [];
  
  const getVisibleNavSections = () => {
    return NAV_SECTIONS.map(section => {
      if (section.isDeveloper && !isDeveloper) {
        return null;
      }
      if (section.permission && !hasPermission(section.permission)) {
        return null;
      }
      
      const visibleItems = section.items.filter(item => 
        hasPermission(item.permission) && !hiddenMenuItems.includes(item.href)
      );
      
      if (visibleItems.length === 0) {
        return null;
      }
      
      return { ...section, items: visibleItems };
    }).filter(Boolean);
  }

  const visibleNavSections = getVisibleNavSections();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const roleLabels: Record<UserRole, string> = {
    developer: 'Desenvolvedor',
    manager: 'Gerente',
    project_manager: 'Gerente de Projeto',
    supervisor_1: 'Supervisor 1',
    supervisor_2: 'Supervisor 2',
    technician_1: 'Técnico 1',
    technician_2: 'Técnico 2',
    guest: 'Convidado',
  };
  
  const accessibleBuildings = React.useMemo(() => {
    if (!dbUser || !buildings) return [];
    if (isDeveloper || realRole === 'manager') {
        return buildings;
    }
    if (dbUser.accessibleBuildingIds && dbUser.accessibleBuildingIds.length > 0) {
        return buildings.filter(b => dbUser.accessibleBuildingIds?.includes(b.id));
    }
    return [];
  }, [dbUser, isDeveloper, realRole, buildings]);

  React.useEffect(() => {
      if (accessibleBuildings.length > 0 && !accessibleBuildings.some(b => b.id === activeBuildingId)) {
          setActiveBuildingId(accessibleBuildings[0].id);
      } else if (accessibleBuildings.length === 0 && activeBuildingId) {
          setActiveBuildingId('');
      }
  }, [accessibleBuildings, activeBuildingId, setActiveBuildingId]);

  if (dbUser && accessibleBuildings.length === 0 && !isDeveloper) {
    return <NoAccessPage />;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar Estática */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Server className="h-6 w-6 text-primary" />
            <span className="text-lg">InfraVision</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            {visibleNavSections.map((section, index) => (
              section && (
                <div key={section.title} className={index > 0 ? 'mt-4 pt-4 border-t' : 'mt-4'}>
                  <h3 className="px-4 mb-2 text-xs text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col sm:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1" />
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={accessibleBuildings.length === 0}>
                    <Building className="mr-2 h-4 w-4" />
                    <span>{accessibleBuildings.find(b => b.id === activeBuildingId)?.name || 'Nenhum Prédio Acessível'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mudar de Prédio</DropdownMenuLabel>
                 <DropdownMenuRadioGroup value={activeBuildingId} onValueChange={setActiveBuildingId}>
                    {accessibleBuildings.map(building => (
                        <DropdownMenuRadioItem key={building.id} value={building.id}>
                            {building.name}
                        </DropdownMenuRadioItem>
                    ))}
                 </DropdownMenuRadioGroup>
              </DropdownMenuContent>
           </DropdownMenu>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                      <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">
                      {roleLabels[viewAs]} {isDeveloper && realRole !== viewAs ? '(Visualizando)' : ''}
                    </p>
                </DropdownMenuLabel>
                 {isDeveloper && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>Ver como</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                         <DropdownMenuRadioGroup value={viewAs} onValueChange={(value) => setViewAsRole(value as UserRole)}>
                          {USER_ROLES.map(role => (
                            <DropdownMenuRadioItem key={role} value={role}>
                              {roleLabels[role]}
                            </DropdownMenuRadioItem>
                          ))}
                         </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
                 <DropdownMenuSeparator />
                {hasPermission('page:settings:view') && (
                    <DropdownMenuItem onSelect={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Preferências</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
      {isDeveloper && showDeveloperMenu && <DeveloperMenu />}
    </div>
  );
}
