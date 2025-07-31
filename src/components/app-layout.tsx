
"use client"
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Server,
  LogOut,
  Users,
  ShieldCheck,
  Building,
  LayoutGrid,
  FlaskConical,
  Upload,
  Network,
  FileText,
  CheckSquare,
  History,
  HardDrive,
  Settings,
  Lock,
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

  // Se o usuário está logado, mas não tem acesso a nenhum prédio, mostra a página de acesso limitado.
  if (dbUser && accessibleBuildings.length === 0 && !isDeveloper) {
    return <NoAccessPage />;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
             <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary">
                  <Server className="text-primary-foreground size-6" />
                </div>
                <h1 className="text-xl font-headline font-semibold text-primary group-data-[state=collapsed]:hidden">InfraVision</h1>
             </div>
             <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent>
           {visibleNavSections.map((section, index) => (
              section && (
                 <SidebarMenu key={section.title} className={index > 0 ? 'mt-4 pt-4 border-t border-sidebar-border' : ''}>
                    <SidebarMenuItem className='px-2 text-xs text-muted-foreground group-data-[state=collapsed]:hidden'>{section.title}</SidebarMenuItem>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith(item.href) && item.href !== '/'}
                          tooltip={{ children: item.label }}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
              )
           ))}
        </SidebarContent>
         <SidebarFooter>
            {/* O menu de perfil foi movido para o cabeçalho */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={accessibleBuildings.length === 0}>
                    <Building className="mr-2" />
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
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        {isDeveloper && showDeveloperMenu && <DeveloperMenu />}
      </SidebarInset>
    </SidebarProvider>
  );
}
