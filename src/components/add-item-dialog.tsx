
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Box, Server, Snowflake, Router, Network, PanelTop, Database, Power, Fan, HardDrive } from "lucide-react";

import { getItemTypes, ItemType } from "@/lib/item-types-actions";
import { addItem } from "@/lib/item-actions";
import type { Room, GridItem } from "@/types/datacenter";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Server, Snowflake, Router, Network, PanelTop, Database, Power, Fan, HardDrive, Box, default: Box,
};

const formSchema = z.object({
  label: z.string().min(3, "O nome do item deve ter pelo menos 3 caracteres."),
  itemTypeId: z.string({ required_error: "Você deve selecionar um tipo de item." }),
});

type FormData = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: (item: GridItem) => void;
}

export function AddItemDialog({ room, open, onOpenChange, onItemAdded }: AddItemDialogProps) {
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const { toast } = useToast();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema) });
  const { isSubmitting, control, handleSubmit, watch } = form;

  const selectedTypeId = watch("itemTypeId");

  useEffect(() => {
    if (open) {
      setIsLoadingTypes(true);
      getItemTypes(true) // Apenas tipos de item pai (para planta baixa)
        .then(setItemTypes)
        .catch(() =>
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os tipos de item.",
          })
        )
        .finally(() => setIsLoadingTypes(false));
    }
  }, [open, toast]);
  
  const onSubmit = async (data: FormData) => {
    const selectedType = itemTypes.find(t => t.id === data.itemTypeId);
    if (!selectedType) {
      toast({ variant: "destructive", title: "Erro", description: "Tipo de item inválido selecionado." });
      return;
    }

    try {
      const newItem = await addItem({ label: data.label, itemType: selectedType, room });
      toast({
        title: "Sucesso!",
        description: `O item "${newItem.label}" foi adicionado à sala.`,
      });
      onItemAdded(newItem);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Adicionar Item",
        description: error.message,
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Item em "{room.name}"</DialogTitle>
          <DialogDescription>
            Selecione o tipo de item e dê um nome a ele.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <Label>1. Selecione o Tipo de Item</Label>
            {isLoadingTypes ? (
              <Loader2 className="mt-2 mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Controller
                name="itemTypeId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <ScrollArea className="h-40 mt-2">
                      <div className="grid grid-cols-2 gap-2 pr-4">
                        {itemTypes.map((type) => {
                          const Icon = iconMap[type.iconName || 'default'] || Box;
                          return (
                            <Card
                              key={type.id}
                              className={cn(
                                "cursor-pointer hover:border-primary",
                                field.value === type.id && "border-primary ring-2 ring-primary"
                              )}
                              onClick={() => field.onChange(type.id)}
                            >
                              <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                                <Icon className="h-6 w-6 text-primary" />
                                <span className="text-sm text-center font-medium">{type.name}</span>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                    {fieldState.error && <p className="text-sm font-medium text-destructive mt-2">{fieldState.error.message}</p>}
                  </>
                )}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Controller
              name="label"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Label htmlFor="label" className={cn(!selectedTypeId && "text-muted-foreground/50")}>
                    2. Dê um nome ao Item
                  </Label>
                  <Input 
                    id="label" 
                    placeholder="Ex: Rack Principal 01" 
                    {...field}
                    disabled={!selectedTypeId || isSubmitting}
                  />
                  {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
                </>
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
            <Button type="submit" disabled={isSubmitting || !selectedTypeId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
