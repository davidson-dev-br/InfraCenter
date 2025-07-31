
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Palette } from "lucide-react";

import { addStatus, updateStatus, ItemStatus } from "@/lib/status-actions";
import { statusColors } from "@/lib/status-config";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
  color: z.enum(statusColors),
  isArchived: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ManageStatusDialogProps {
  mode: 'add' | 'edit';
  status?: ItemStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorStyles: Record<typeof statusColors[number], string> = {
    gray: "bg-gray-500", red: "bg-red-500", orange: "bg-orange-500",
    amber: "bg-amber-500", yellow: "bg-yellow-500", lime: "bg-lime-500",
    green: "bg-green-500", emerald: "bg-emerald-500", teal: "bg-teal-500",
    cyan: "bg-cyan-500", sky: "bg-sky-500", blue: "bg-blue-500",
    indigo: "bg-indigo-500", violet: "bg-violet-500", purple: "bg-purple-500",
    fuchsia: "bg-fuchsia-500", pink: "bg-pink-500", rose: "bg-rose-500",
};


export function ManageStatusDialog({ mode, status, open, onOpenChange }: ManageStatusDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        description: "",
        color: "gray",
        isArchived: false,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && status) {
        form.reset({
            name: status.name,
            description: status.description || "",
            color: status.color,
            isArchived: status.isArchived,
        });
    } else {
        form.reset({
            name: "", description: "", color: "gray", isArchived: false,
        });
    }
  }, [status, mode, open, form]);


  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addStatus(data);
        toast({ title: "Sucesso!", description: `O status "${data.name}" foi criado.` });
      } else if (status) {
        await updateStatus(status.id, data);
        toast({ title: "Sucesso!", description: `O status "${data.name}" foi atualizado.` });
      }
      form.reset();
      onOpenChange(false);
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o status.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Status' : `Editar Status: ${status?.name}`}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? "Crie um novo status para o ciclo de vida dos seus itens."
              : "Edite as propriedades deste status. Note que status padrão não podem ser editados."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Ex: Em Reparo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea placeholder="Descreva quando usar este status" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-4 w-4 rounded-full", colorStyles[color])} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>É um Status de Arquivo?</FormLabel>
                            <DialogDescription className="text-xs">
                                Marque se este status representa um item que não deve mais aparecer na planta baixa (ex: Descomissionado).
                            </DialogDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'add' ? 'Adicionar Status' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
