
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreVertical, Loader2, Building, Trash2 } from "lucide-react";

import type { User } from "@/lib/user-service";
import type { UserRole } from "@/components/permissions-provider";
import { USER_ROLES, usePermissions } from "@/components/permissions-provider";
import { PERMISSIONS_REGISTRY, getPermissionsByCategory } from "@/lib/permissions-registry";
import { updateUser, deleteUser } from "@/lib/user-actions";
import { getRolePermissions } from "@/lib/role-actions";
import { getBuildingsList } from "@/lib/building-actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";


const roleLabels: Record<UserRole, string> = {
  developer: "Desenvolvedor",
  manager: "Gerente",
  project_manager: "Gerente de Projeto",
  supervisor_1: "Supervisor 1",
  supervisor_2: "Supervisor 2",
  technician_1: "Técnico 1",
  technician_2: "Técnico 2",
  guest: "Convidado",
};

const roleHierarchy: Record<UserRole, number> = {
  developer: 99,
  manager: 90,
  project_manager: 80,
  supervisor_1: 70,
  supervisor_2: 60,
  technician_1: 50,
  technician_2: 40,
  guest: 10,
};

const formSchema = z.object({
  id: z.string().min(1, "O UID do Firebase é obrigatório."),
  role: z.enum(USER_ROLES),
  permissions: z.array(z.string()),
  accessibleBuildingIds: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface Building {
  id: string;
  name: string;
}

interface ManageUserButtonProps {
  user: User;
}

const permissionsByCategory = getPermissionsByCategory();

export function ManageUserButton({ user }: ManageUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [defaultPermissions, setDefaultPermissions] = useState<Record<UserRole, string[]>>({} as any);

  const { hasPermission: adminHasPermission, user: adminUser, isDeveloper } = usePermissions();

  useEffect(() => {
    if (isOpen) {
      getRolePermissions().then(setDefaultPermissions);
      getBuildingsList().then(setBuildings);
    }
  }, [isOpen]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: user.id,
      role: user.role,
      permissions: user.permissions || [],
      accessibleBuildingIds: user.accessibleBuildingIds || [],
    },
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    if (isOpen) {
        form.reset({
            id: user.id,
            role: user.role,
            permissions: user.permissions || defaultPermissions[user.role] || [],
            accessibleBuildingIds: user.accessibleBuildingIds || [],
        })
    }
  }, [isOpen, user, defaultPermissions, form]);

  useEffect(() => {
    if (!isOpen || !selectedRole || !defaultPermissions[selectedRole]) return;

    const defaultPermsForRole = defaultPermissions[selectedRole];
    let newPermissions: string[];

    if (defaultPermsForRole.includes('*')) {
      newPermissions = PERMISSIONS_REGISTRY.map(p => p.id);
    } else {
      newPermissions = defaultPermsForRole;
    }
    form.setValue("permissions", newPermissions, { shouldDirty: true });
    
  // A dependência `form` é omitida para evitar um loop, pois `setValue` a modifica.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, defaultPermissions, isOpen]);


  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updateUser({ 
          id: data.id,
          email: user.email, // O email não deve ser editável aqui
          role: data.role,
          permissions: data.permissions ? Array.from(data.permissions) : [],
          accessibleBuildingIds: data.accessibleBuildingIds ? Array.from(data.accessibleBuildingIds) : [],
       });
      toast({
        title: "Sucesso!",
        description: `As permissões de ${user.displayName || user.email} foram atualizadas.`,
      });
      setIsOpen(false);
      router.refresh(); 
    } catch (error) {
      console.error("Falha ao atualizar usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar as permissões do usuário.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    try {
        await deleteUser(user.id);
        toast({
            title: "Usuário Removido",
            description: `${user.displayName || user.email} foi removido da autenticação e do banco de dados.`,
        });
        setConfirmDeleteOpen(false);
        setIsOpen(false);
        router.refresh();
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: error.message || "Não foi possível excluir o usuário.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const isManagementDisabled = 
    adminUser?.id === user.id || 
    (adminUser?.role !== 'developer' && roleHierarchy[adminUser?.role ?? 'guest'] <= roleHierarchy[user.role]);

  const getDisabledReason = () => {
    if (adminUser?.id === user.id) return "Não é possível gerenciar a si mesmo.";
    if (isManagementDisabled) return "Você não pode gerenciar um usuário de nível igual ou superior.";
    return "Gerenciar Usuário";
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isManagementDisabled} 
          title={getDisabledReason()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Gerenciar Usuário</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Altere o cargo e ajuste as permissões individuais para {user.displayName || user.email}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Controller
                control={form.control}
                name="id"
                render={({ field }) => (
                    <div>
                        <Label htmlFor="uid">Firebase UID (ID do Usuário)</Label>
                        <Input id="uid" {...field} disabled={true} />
                        <p className="text-xs text-muted-foreground mt-1">O UID do Firebase não pode ser alterado.</p>
                    </div>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Controller
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                {USER_ROLES.map((role) => (
                                    (role !== 'guest' && roleHierarchy[role] < roleHierarchy[adminUser?.role ?? 'guest']) && (
                                    <SelectItem key={role} value={role}>
                                        {roleLabels[role]}
                                    </SelectItem>
                                    )
                                ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Acesso aos Prédios</Label>
                    <ScrollArea className="h-24 w-full rounded-md border">
                        <div className="p-4 space-y-2">
                            <Controller
                                name="accessibleBuildingIds"
                                control={form.control}
                                render={({ field }) => (
                                    <>
                                        {buildings.map((building) => (
                                            <div key={building.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`building-${building.id}`}
                                                    checked={field.value?.includes(building.id)}
                                                    onCheckedChange={(checked) => {
                                                        const newValue = checked
                                                            ? [...(field.value || []), building.id]
                                                            : (field.value || []).filter((id) => id !== building.id);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                <Label htmlFor={`building-${building.id}`} className="font-normal flex items-center">
                                                    <Building className="inline-block mr-2 h-4 w-4 text-muted-foreground"/>
                                                    {building.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </>
                                )}
                             />
                        </div>
                    </ScrollArea>
                </div>
            </div>
            
             <Separator />
            
            <div className="space-y-2">
                <Label>Permissões Individuais (Sobrescrevem o padrão do cargo)</Label>
                <ScrollArea className="h-60 w-full rounded-md border p-4">
                     <Controller
                        name="permissions"
                        control={form.control}
                        render={({ field }) => (
                            <Accordion type="multiple" defaultValue={Object.keys(permissionsByCategory)} className="w-full">
                                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                                <AccordionItem key={category} value={category}>
                                    <AccordionTrigger className="text-base font-semibold">{category}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pl-2">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-start gap-3">
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={field.value?.includes(permission.id)}
                                                    onCheckedChange={(checked) => {
                                                        const newValue = checked
                                                        ? [...(field.value || []), permission.id]
                                                        : (field.value || []).filter((id) => id !== permission.id);
                                                        field.onChange(newValue);
                                                    }}
                                                    disabled={!adminHasPermission(permission.id)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label 
                                                      htmlFor={permission.id} 
                                                      className={`text-sm font-medium leading-none ${!adminHasPermission(permission.id) ? "cursor-not-allowed opacity-70" : "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"}`}
                                                    >
                                                        {permission.name}
                                                    </label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {permission.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    />
                </ScrollArea>
            </div>
            
            <DialogFooter className="justify-between pt-4">
                <div>
                  <Button variant="destructive" type="button" onClick={() => setConfirmDeleteOpen(true)} disabled={isSubmitting}>
                      <Trash2 className="mr-2" />
                      Excluir Usuário
                  </Button>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                </div>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>

     <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação é <span className="font-bold">permanente</span> e removerá o usuário 
                <span className="font-bold"> {user.displayName || user.email} </span> 
                tanto do sistema de autenticação quanto do banco de dados do InfraVision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Entendi, excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
