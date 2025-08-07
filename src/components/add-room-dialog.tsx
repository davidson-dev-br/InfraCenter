
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { addRoom } from "@/lib/room-actions";
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
import { Separator } from "./ui/separator";

const formSchema = z.object({
  name: z.string().min(3, "O nome da sala deve ter pelo menos 3 caracteres."),
  largura: z.coerce.number().optional(),
  comprimento: z.coerce.number().optional(),
  tileWidthCm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
  tileHeightCm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddRoomDialogProps {
  buildingId: string;
  buildingName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoomDialog({ buildingId, buildingName, open, onOpenChange }: AddRoomDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      largura: '' as any,
      comprimento: '' as any,
      tileWidthCm: 60 as any,
      tileHeightCm: 60 as any,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await addRoom({ buildingId, ...data });
      toast({
        title: "Sucesso!",
        description: `A sala "${data.name}" foi adicionada ao prédio "${buildingName}".`,
      });
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Falha ao adicionar sala:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a sala. Verifique se o nome já existe neste prédio.",
      });
    }
  };

  // Reset form when dialog is closed
  if (!open && form.formState.isDirty) {
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Sala em "{buildingName}"</DialogTitle>
          <DialogDescription>
            Insira os detalhes da nova sala.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Sala</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sala de Servidores A01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            <p className="text-sm font-medium text-foreground">Dimensões da Sala</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="largura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura (m)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 10.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comprimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprimento (m)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            <p className="text-sm font-medium text-foreground">Dimensões do Piso Elevado</p>
             <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tileWidthCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura do Piso (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tileHeightCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprimento do Piso (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


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
                    Adicionando...
                  </>
                ) : "Adicionar Sala"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    

