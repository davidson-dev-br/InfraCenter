

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
import { getManufacturers, Manufacturer } from '@/lib/manufacturer-actions';
import { getModelsByManufacturerId, Model } from '@/lib/models-actions';
import { updateItem } from '@/lib/item-update-actions';

const formSchema = z.object({
  label: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  parentId: z.string({ required_error: "Você deve selecionar um item pai." }),
  manufacturerId: z.string({ required_error: "Você deve selecionar um fabricante." }),
  modelId: z.string({ required_error: "Você deve selecionar um modelo." }),
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
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const parentCandidates = allItems.filter(item => item.tamanhoU && item.tamanhoU > 0);
  const selectedManufacturerId = form.watch('manufacturerId');
  
  useEffect(() => {
    if (open) {
      setIsLoadingManufacturers(true);
      getManufacturers()
        .then(setManufacturers)
        .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os fabricantes." }))
        .finally(() => setIsLoadingManufacturers(false));
    }
  }, [open, toast]);
  
  useEffect(() => {
      if (selectedManufacturerId) {
          setIsLoadingModels(true);
          setModels([]); 
          form.setValue('modelId', ''); 
          getModelsByManufacturerId(selectedManufacturerId)
              .then(setModels)
              .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os modelos." }))
              .finally(() => setIsLoadingModels(false));
      } else {
          setModels([]);
      }
  // A dependência `form` é omitida para evitar um loop, pois `setValue` a modifica.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerId]);


  const onSubmit = async (data: FormData) => {
    try {
        const selectedModel = models.find(m => m.id === data.modelId);
        if (!selectedModel) {
            throw new Error("Modelo selecionado não é válido.");
        }

        const newId = `citem_${Date.now()}`;
        
        await updateItem({
            id: newId,
            label: data.label,
            type: selectedModel.name, // O tipo do item agora é o nome do modelo.
            modelo: selectedModel.name, // Armazena o nome do modelo
            brand: manufacturers.find(m => m.id === data.manufacturerId)?.name,
            parentId: data.parentId,
            status: 'draft',
            posicaoU: data.posicaoU || null,
            tamanhoU: selectedModel.tamanhoU,
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
                  <FormLabel>Nome do Equipamento (Hostname)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SRV-WEB-01" {...field} />
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
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="manufacturerId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fabricante</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingManufacturers}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {manufacturers.map((man) => (
                            <SelectItem key={man.id} value={man.id}>{man.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingModels || !selectedManufacturerId}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingModels ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        ))}
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
