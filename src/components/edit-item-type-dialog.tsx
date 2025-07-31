

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Server, Snowflake, Router, Network, PanelTop, Database, Power, Fan, HardDrive, Box } from "lucide-react";

import { updateItemType } from "@/lib/item-types-actions";
import type { ItemType } from "@/lib/item-types-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { ScrollArea } from "./ui/scroll-area";

const iconList = [
  { name: 'Server', icon: Server },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Router', icon: Router },
  { name: 'Network', icon: Network },
  { name: 'PanelTop', icon: PanelTop },
  { name: 'Database', icon: Database },
  { name: 'Power', icon: Power },
  { name: 'Fan', icon: Fan },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Box', icon: Box },
];

const parentItemTypeSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  category: z.string().min(3, "A categoria deve ter pelo menos 3 caracteres."),
  defaultWidthM: z.coerce.number().positive("A largura deve ser um número positivo."),
  defaultHeightM: z.coerce.number().positive("A altura deve ser um número positivo."),
  iconName: z.string().optional(),
  canHaveChildren: z.boolean(),
  isResizable: z.boolean(),
  defaultColor: z.string().optional(),
});

const childItemTypeSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    iconName: z.string().optional(),
    // Para manter a consistência, mesmo que oculto, o schema precisa corresponder à action
    category: z.string().default('Equipamento'),
    defaultWidthM: z.coerce.number().default(0),
    defaultHeightM: z.coerce.number().default(0),
    defaultColor: z.string().optional(),
});


interface EditItemTypeDialogProps {
  itemType: ItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isParentType: boolean;
}

export function EditItemTypeDialog({ itemType, open, onOpenChange, isParentType }: EditItemTypeDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(isParentType ? parentItemTypeSchema : childItemTypeSchema),
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        name: itemType.name,
        category: itemType.category,
        defaultWidthM: itemType.defaultWidthM,
        defaultHeightM: itemType.defaultHeightM,
        iconName: itemType.iconName || "",
        canHaveChildren: itemType.canHaveChildren,
        isResizable: itemType.isResizable,
        defaultColor: itemType.defaultColor || "",
      });
    }
  }, [open, itemType, form]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (data: any) => {
    try {
      await updateItemType(itemType.id, data, isParentType);
      toast({
        title: "Sucesso!",
        description: `O tipo de item "${data.name}" foi atualizado.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Falha ao atualizar tipo de item:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar o tipo de item.",
      });
    }
  };
  
  const renderParentForm = () => (
     <>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Rack 42U" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Gabinetes" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="defaultWidthM" render={({ field }) => (
                <FormItem><FormLabel>Largura Padrão (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="defaultHeightM" render={({ field }) => (
                <FormItem><FormLabel>Altura Padrão (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="iconName" render={({ field }) => (
                <FormItem><FormLabel>Ícone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um ícone..." /></SelectTrigger></FormControl>
                    <SelectContent><ScrollArea className="h-48">{iconList.map((icon) => (<SelectItem key={icon.name} value={icon.name}><div className="flex items-center gap-2"><icon.icon className="h-4 w-4" /><span>{icon.name}</span></div></SelectItem>))}</ScrollArea></SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="defaultColor" render={({ field }) => (
                <FormItem><FormLabel>Cor Padrão</FormLabel><FormControl><Input type="color" {...field} value={field.value ?? ''} className="h-10" /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="flex items-center space-x-8 pt-2">
            <FormField control={form.control} name="isResizable" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5 mr-4"><FormLabel>Redimensionável</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )}/>
            <FormField control={form.control} name="canHaveChildren" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5 mr-4"><FormLabel>Pode Aninhar</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )}/>
        </div>
    </>
  );

  const renderChildForm = () => (
     <>
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome do Tipo de Equipamento</FormLabel><FormControl><Input placeholder="Ex: Servidor, Switch, Patch Panel" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="iconName" render={({ field }) => (
            <FormItem><FormLabel>Ícone</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um ícone..." /></SelectTrigger></FormControl>
                <SelectContent><ScrollArea className="h-48">{iconList.map((icon) => (<SelectItem key={icon.name} value={icon.name}><div className="flex items-center gap-2"><icon.icon className="h-4 w-4" /><span>{icon.name}</span></div></SelectItem>))}</ScrollArea></SelectContent>
            </Select><FormMessage /></FormItem>
        )}/>
     </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tipo de Item: {itemType.name}</DialogTitle>
          <DialogDescription>
            Altere os atributos deste tipo de equipamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {isParentType ? renderParentForm() : renderChildForm()}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

