
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { updateRoom } from "@/lib/room-actions";
import type { Room } from "@/types/datacenter";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(3, "O nome da sala deve ter pelo menos 3 caracteres."),
  largura: z.coerce.number().optional(),
  comprimento: z.coerce.number().optional(),
  tileWidthCm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
  tileHeightCm: z.coerce.number().positive("O valor deve ser positivo.").optional(),
  xAxisNaming: z.enum(['alpha', 'numeric']),
  yAxisNaming: z.enum(['alpha', 'numeric']),
});

type FormData = z.infer<typeof formSchema>;

interface RenameRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameRoomDialog({ room, open, onOpenChange }: RenameRoomDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room.name,
      largura: room.largura || undefined,
      comprimento: room.comprimento || undefined,
      tileWidthCm: room.tileWidthCm || 60,
      tileHeightCm: room.tileHeightCm || 60,
      xAxisNaming: room.xAxisNaming || 'alpha',
      yAxisNaming: room.yAxisNaming || 'numeric',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: room.name,
        largura: room.largura || undefined,
        comprimento: room.comprimento || undefined,
        tileWidthCm: room.tileWidthCm || 60,
        tileHeightCm: room.tileHeightCm || 60,
        xAxisNaming: room.xAxisNaming || 'alpha',
        yAxisNaming: room.yAxisNaming || 'numeric',
      });
    }
  }, [open, room, form]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await updateRoom({ id: room.id, ...data });
      toast({
        title: "Sucesso!",
        description: `A sala "${data.name}" foi atualizada.`,
      });
      onOpenChange(false);
      // Força o recarregamento da página para que o datacenter-client pegue os novos dados.
      router.refresh(); 
      window.location.reload(); // Solução mais forte para garantir que o cliente recarregue
    } catch (error) {
      console.error("Falha ao atualizar sala:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a sala. Verifique os dados e tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Sala: {room.name}</DialogTitle>
          <DialogDescription>
            Altere os detalhes da sala. Clique em salvar para aplicar as alterações.
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
                      <Input type="number" step="0.1" placeholder="Ex: 10.5" {...field} value={field.value ?? ''} />
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
                      <Input type="number" step="0.1" placeholder="Ex: 12" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <Separator />
            <p className="text-sm font-medium text-foreground">Piso Elevado e Grid</p>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="tileWidthCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura do Piso (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Comp. do Piso (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="xAxisNaming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eixo X (Colunas)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="alpha">Alfabético (A, B...)</SelectItem>
                            <SelectItem value="numeric">Numérico (1, 2...)</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="yAxisNaming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eixo Y (Linhas)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="numeric">Numérico (1, 2...)</SelectItem>
                            <SelectItem value="alpha">Alfabético (A, B...)</SelectItem>
                          </SelectContent>
                        </Select>
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
