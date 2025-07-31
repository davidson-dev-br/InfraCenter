
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '@/components/permissions-provider';
import { NAV_SECTIONS, NavItem } from '@/lib/menu-config';
import { updateUser } from '@/lib/user-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, hasPermission } = usePermissions();
  const { toast } = useToast();
  const router = useRouter();

  const [hiddenItems, setHiddenItems] = React.useState<string[]>(
    user?.preferences?.hiddenMenuItems || []
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setHiddenItems(user?.preferences?.hiddenMenuItems || []);
  }, [user]);

  const handleToggle = (itemId: string, isVisible: boolean) => {
    setHiddenItems(prev => {
      if (isVisible) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUser({
        id: user.id,
        preferences: {
          ...user.preferences,
          hiddenMenuItems: hiddenItems,
        },
      });
      toast({
        title: "Sucesso!",
        description: "Suas preferências de visualização foram salvas.",
      });
      // Forçar uma atualização completa para que o AuthProvider possa buscar o novo usuário
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas preferências.",
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getVisibleNavSections = React.useCallback(() => {
    return NAV_SECTIONS.map(section => {
      if (section.isDeveloper && !hasPermission('*')) {
        return null;
      }
      if (section.permission && !hasPermission(section.permission)) {
        return null;
      }
      // Filtra os itens que o usuário pode ver E que não são a própria página de configurações
      const visibleItems = section.items.filter(item => 
        hasPermission(item.permission) && item.href !== '/settings'
      );
      
      if (visibleItems.length === 0) {
        return null;
      }
      return { ...section, items: visibleItems };
    }).filter(Boolean);
  }, [hasPermission]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Usuário</CardTitle>
          <CardDescription>
            Personalize sua experiência no InfraVision. Desative os itens de menu que você não usa com frequência para uma interface mais limpa.
            As permissões de acesso ainda se aplicam.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {getVisibleNavSections().map(section => (
            section && (
              <div key={section.title} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l">
                  {section.items.map((item: NavItem) => (
                    <div key={item.href} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <Label htmlFor={item.href} className="flex items-center gap-3 cursor-pointer">
                        <item.icon className="text-muted-foreground" />
                        <span>{item.label}</span>
                      </Label>
                      <Switch
                        id={item.href}
                        checked={!hiddenItems.includes(item.href)}
                        onCheckedChange={(checked) => handleToggle(item.href, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Preferências
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
