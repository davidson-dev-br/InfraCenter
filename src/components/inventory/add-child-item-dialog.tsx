

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { GridItem } from '@/types/datacenter';
import { getItemTypes, ItemType } from '@/lib/item-types-actions';
import { updateItem } from '@/lib/item-actions';

const formSchema = z.object({
  label: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  parentId: z.string({ required_error: "Você deve selecionar um item pai." }),
  type: z.string({ required_error: "Você deve selecionar um tipo de equipamento." }),
  posicaoU: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddChildItemDialogProps {
  allItems: GridItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChildItemDialog({ allItems, open, onOpenChange }: AddChildItemDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const parentCandidates = allItems.filter(item => item.tamanhoU && item.tamanhoU > 0);
  
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Fetch types for child items (isParentType = false)
      getItemTypes(false) 
        .then(setItemTypes)
        .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os tipos de item." }))
        .finally(() => setIsLoading(false));
    }
  }, [open, toast]);

  const onSubmit = async (data: FormData) => {
    try {
        const newId = `citem_${Date.now()}`;
        
        await updateItem({
            id: newId,
            label: data.label,
            type: data.type,
            parentId: data.parentId,
            status: 'draft',
            posicaoU: data.posicaoU || null, // Garante que o valor seja null e não undefined
        });

      toast({
        title: "Sucesso!",
        description: `O equipamento "${data.label}" foi adicionado.`,
      });
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível adicionar o equipamento.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento Aninhado</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para adicionar um novo servidor, switch, etc., dentro de um item existente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Servidor WEB-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Aninhar Dentro de (Pai)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o rack..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {parentCandidates.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="posicaoU"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Posição U</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 21" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Equipamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar Equipamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
