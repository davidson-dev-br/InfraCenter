
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2 } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';

import type { UserRole } from "@/components/permissions-provider";
import { USER_ROLES, usePermissions } from "@/components/permissions-provider";
import { updateUser } from "@/lib/user-actions";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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

const formSchema = z.object({
  displayName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(USER_ROLES, { required_error: "Selecione um cargo." }),
});

type FormData = z.infer<typeof formSchema>;

export function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isDeveloper } = usePermissions();
  const auth = getAuth(app);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", displayName: "", password: "", role: "technician_2" },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Criar usuário no Firebase Auth (no cliente)
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Atualiza o nome do perfil no Firebase Auth
      await updateProfile(firebaseUser, { displayName: data.displayName });

      // 2. Chamar a Server Action para salvar no banco de dados
      await updateUser({
        id: firebaseUser.uid, // Usa o UID retornado pelo Firebase
        email: data.email,
        displayName: data.displayName, 
        role: data.role,
        lastLoginAt: new Date().toISOString(),
      });

      toast({
        title: "Sucesso!",
        description: `Usuário ${data.displayName} foi criado e registrado no sistema.`,
      });
      
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error: any) {
      console.error("Falha ao adicionar usuário:", error);
      let errorMessage = "Não foi possível registrar o usuário.";
      if (error.code === 'auth/email-already-in-use') {
          errorMessage = "Este e-mail já está sendo usado por outra conta.";
      }
      toast({
        variant: "destructive",
        title: "Erro ao Criar Usuário",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar uma nova conta de usuário no sistema de autenticação e no banco de dados local.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                   <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                   <FormControl>
                      <Input type="email" placeholder="Ex: joao.silva@empresa.com" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                   <FormControl>
                      <Input type="password" placeholder="Mínimo de 6 caracteres" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        (role !== 'guest' && (isDeveloper || role !== 'developer')) && (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : "Adicionar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
