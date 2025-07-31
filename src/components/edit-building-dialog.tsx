
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { updateBuilding } from "@/lib/building-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  name: z.string().min(3, "O nome do prédio deve ter pelo menos 3 caracteres."),
  address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditBuildingDialogProps {
  building: {
    id: string;
    name: string;
    address?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBuildingDialog({ building, open, onOpenChange }: EditBuildingDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: building.name,
      address: building.address || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: building.name,
        address: building.address || "",
      });
    }
  }, [open, building, form]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await updateBuilding({ id: building.id, ...data });
      toast({
        title: "Sucesso!",
        description: `O prédio "${data.name}" foi atualizado.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Falha ao atualizar prédio:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o prédio. Verifique os dados e tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Prédio: {building.name}</DialogTitle>
          <DialogDescription>
            Altere o nome ou endereço do prédio. Clique em salvar para aplicar as alterações.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Prédio</FormLabel>
                   <FormControl>
                      <Input placeholder="Ex: Data Center Principal" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Opcional)</FormLabel>
                   <FormControl>
                      <Input placeholder="Ex: Av. Principal, 123, Cidade - Estado" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
