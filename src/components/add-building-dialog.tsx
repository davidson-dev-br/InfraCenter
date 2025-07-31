
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";

import { addBuilding } from "@/lib/building-actions";

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
  name: z.string().min(3, "O nome do prédio deve ter pelo menos 3 caracteres."),
  address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddBuildingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await addBuilding(data.name, data.address);

      toast({
        title: "Sucesso!",
        description: `O prédio "${data.name}" foi adicionado.`,
      });
      
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error) {
      console.error("Falha ao adicionar prédio:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o prédio. Verifique se o nome já existe ou tente novamente.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Adicionar Prédio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Prédio</DialogTitle>
          <DialogDescription>
            Insira os detalhes do novo prédio que você deseja gerenciar.
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
                ) : "Adicionar Prédio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    