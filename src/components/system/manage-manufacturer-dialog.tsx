
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { addManufacturer, updateManufacturer, Manufacturer } from "@/lib/manufacturer-actions";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "O nome do fabricante deve ter pelo menos 2 caracteres."),
});

type FormData = z.infer<typeof formSchema>;

interface ManageManufacturerDialogProps {
  mode: 'add' | 'edit';
  manufacturer?: Manufacturer;
  children: React.ReactNode;
}

export function ManageManufacturerDialog({ mode, manufacturer, children }: ManageManufacturerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isOpen) {
        if (mode === 'edit' && manufacturer) {
            form.reset({ name: manufacturer.name });
        } else {
            form.reset({ name: "" });
        }
    }
  }, [manufacturer, mode, isOpen, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addManufacturer(data);
        toast({ title: "Sucesso!", description: `O fabricante "${data.name}" foi criado.` });
      } else if (manufacturer) {
        await updateManufacturer(manufacturer.id, data);
        toast({ title: "Sucesso!", description: `O fabricante "${data.name}" foi atualizado.` });
      }
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o fabricante.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Fabricante' : `Editar Fabricante`}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? "Crie um novo fabricante para usar nos formulários de equipamentos."
              : `Editando o fabricante: ${manufacturer?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Fabricante</FormLabel>
                  <FormControl><Input placeholder="Ex: Dell, Cisco, HP" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'add' ? 'Adicionar Fabricante' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
