
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2 } from "lucide-react";

import type { UserRole } from "@/components/permissions-provider";
import { USER_ROLES } from "@/components/permissions-provider";
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
  email: z.string().email("Por favor, insira um e-mail válido."),
  displayName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  role: z.enum(USER_ROLES, {
    required_error: "Selecione um cargo.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "technician_2", // Cargo padrão sugerido
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updateUser({ 
        email: data.email, 
        displayName: data.displayName, 
        role: data.role 
      });

      toast({
        title: "Sucesso!",
        description: `Usuário ${data.displayName} foi adicionado. Eles poderão fazer login agora.`,
      });
      
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error) {
      console.error("Falha ao adicionar usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o usuário. Verifique se o e-mail já existe.",
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
            Preencha os dados abaixo para criar um novo usuário. Eles receberão acesso ao sistema assim que forem adicionados.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input placeholder="Ex: joao.silva@empresa.com" {...field} />
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
                        (role !== 'guest' && role !== 'developer') && (
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
