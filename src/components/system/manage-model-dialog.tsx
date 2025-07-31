
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { getManufacturers, Manufacturer } from "@/lib/manufacturer-actions";
import { addModel, updateModel, Model } from "@/lib/models-actions";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, 'O nome do modelo é obrigatório.'),
  manufacturerId: z.string({ required_error: "É obrigatório selecionar um fabricante." }),
  portConfig: z.string().optional().nullable(),
  tamanhoU: z.coerce.number().int().positive().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface ManageModelDialogProps {
  mode: 'add' | 'edit';
  model?: Model;
  children: React.ReactNode;
}

export function ManageModelDialog({ mode, model, children }: ManageModelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        manufacturerId: "",
        portConfig: "",
        tamanhoU: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
        getManufacturers().then(setManufacturers);
        if (mode === 'edit' && model) {
            form.reset({
                name: model.name,
                manufacturerId: model.manufacturerId,
                portConfig: model.portConfig || "",
                tamanhoU: model.tamanhoU || undefined,
            });
        } else {
            form.reset({ name: "", manufacturerId: "", portConfig: "", tamanhoU: undefined });
        }
    }
  }, [model, mode, isOpen, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'add') {
        await addModel(data);
        toast({ title: "Sucesso!", description: `O modelo "${data.name}" foi criado.` });
      } else if (model) {
        await updateModel(model.id, data);
        toast({ title: "Sucesso!", description: `O modelo "${data.name}" foi atualizado.` });
      }
      form.reset();
      setIsOpen(false);
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o modelo.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Adicionar Novo Modelo' : `Editar Modelo`}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? "Crie um novo modelo de equipamento, associando-o a um fabricante."
              : `Editando o modelo: ${model?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="manufacturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o fabricante..." />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl><Input placeholder="Ex: Catalyst 2960, PowerEdge R740" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="tamanhoU"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tamanho (U)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 1, 2, 4" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="portConfig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuração de Portas Padrão</FormLabel>
                  <FormControl><Textarea placeholder="Ex: 24xRJ45;4xSFP+;1xConsole" {...field} value={field.value ?? ''}/></FormControl>
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
                {mode === 'add' ? 'Adicionar Modelo' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
