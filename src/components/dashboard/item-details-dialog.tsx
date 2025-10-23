
"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { PlacedItem } from "@/lib/types";
import { Clock, CheckCircle2, Trash2, Camera, FileImage } from "lucide-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useInfra } from "./datacenter-switcher";
import { DeleteItemDialog } from "./delete-item-dialog";
import { useToast } from "@/hooks/use-toast";

// Helper function to resize images
const MAX_IMAGE_DIMENSION = 1024;
const resizeImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_IMAGE_DIMENSION) {
                    height *= MAX_IMAGE_DIMENSION / width;
                    width = MAX_IMAGE_DIMENSION;
                }
            } else {
                if (height > MAX_IMAGE_DIMENSION) {
                    width *= MAX_IMAGE_DIMENSION / height;
                    height = MAX_IMAGE_DIMENSION;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};


type ItemDetailsDialogProps = {
  item: PlacedItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedItem: PlacedItem) => void;
  container?: HTMLElement | null;
};

export function ItemDetailsDialog({ item, isOpen, onOpenChange, onSave, container }: ItemDetailsDialogProps) {
  const { buildings } = useInfra();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<PlacedItem>>({});

  const [cameraMode, setCameraMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const cleanupCamera = () => {
    if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
        setCameraMode(false);
        if (item) {
          setFormData(item);
        }
    }
  }, [item, isOpen]);

  useEffect(() => {
    if (!isOpen) {
        setCameraMode(false);
        cleanupCamera();
    }
    return () => {
        cleanupCamera();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [id]: isNumber ? parseFloat(value) || 0 : value }));
  };
  
  const handleSwitchChange = (id: 'isTagEligible') => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as PlacedItem['status'] }));
  };
  
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
        const sanitizedData = {
            ...formData,
            serialNumber: formData.serialNumber || null,
            entryDate: formData.entryDate || null,
            brand: formData.brand || null,
            tag: formData.tag || null,
            description: formData.description || '',
            trellisId: formData.trellisId || null,
            ownerEmail: formData.ownerEmail || null,
            dataSheetUrl: formData.dataSheetUrl || null,
            row: formData.row || null,
            color: formData.color || null,
            imageUrl: formData.imageUrl || null,
        };
        onSave({ ...item, ...sanitizedData } as PlacedItem);
    }
  };

  const handleApprove = () => {
    if (item) {
      const sanitizedData = {
          ...formData,
          awaitingApproval: false,
          serialNumber: formData.serialNumber || null,
          entryDate: formData.entryDate || null,
          brand: formData.brand || null,
          tag: formData.tag || null,
          description: formData.description || '',
          trellisId: formData.trellisId || null,
          ownerEmail: formData.ownerEmail || null,
          dataSheetUrl: formData.dataSheetUrl || null,
          row: formData.row || null,
          color: formData.color || null,
          imageUrl: formData.imageUrl || null,
      };
      onSave({ ...item, ...sanitizedData } as PlacedItem);
    }
  }

  const handleDeletionSuccess = () => {
    onOpenChange(false); // Close the details dialog after deletion
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          try {
            const resizedUri = await resizeImage(event.target.result);
            setFormData(prev => ({ ...prev, imageUrl: resizedUri }));
          } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao processar imagem', description: 'O arquivo pode estar corrompido.' });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCameraClick = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        toast({ variant: 'destructive', title: 'Câmera não suportada', description: 'Seu navegador não suporta acesso à câmera.' });
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoStreamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setCameraMode(true);
    } catch (error) {
        console.error('Error accessing camera:', error);
        toast({ variant: 'destructive', title: 'Acesso à Câmera Negado', description: 'Habilite a permissão nas configurações do seu navegador.' });
    }
  };

  const handleCapture = async () => {
    if (videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const capturedUri = canvas.toDataURL('image/jpeg');
            try {
              const resizedUri = await resizeImage(capturedUri);
              setFormData(prev => ({ ...prev, imageUrl: resizedUri }));
            } catch (error) {
              toast({ variant: 'destructive', title: 'Erro ao capturar imagem' });
            } finally {
              setCameraMode(false);
              cleanupCamera();
            }
        }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({...prev, imageUrl: null}));
  };

  const dcRoom = useMemo(() => {
    if (!item?.roomId) return 'N/A';
    for (const building of buildings) {
      const room = building.rooms.find(r => r.id === item.roomId);
      if (room) {
        return `${building.name} / ${room.name}`;
      }
    }
    return 'N/A';
  }, [item?.roomId, buildings]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent container={container} className="sm:max-w-4xl">
        <form onSubmit={handleSaveChanges}>
            <DialogHeader>
                <DialogTitle>Detalhes do Item: {formData.name}</DialogTitle>
                <DialogDescription>
                    Edite as propriedades do item selecionado, conforme solicitado para compatibilidade.
                </DialogDescription>
            </DialogHeader>

            {formData.awaitingApproval && (
                <div className="pt-4">
                    <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 w-fit font-semibold">
                        <Clock className="w-4 h-4 mr-2" />
                        Aguardando Aprovação
                    </Badge>
                </div>
            )}
            
            <ScrollArea className="h-[60vh] p-1">
              <div className="grid gap-6 py-4 pr-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2 lg:col-span-3">
                          <Label htmlFor="name">Nome</Label>
                          <Input id="name" value={formData.name || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="serialNumber">Serial</Label>
                          <Input id="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} />
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="entryDate">Data de Entrada</Label>
                          <Input id="entryDate" type="date" value={formData.entryDate || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Input id="type" value={formData.type || ''} disabled />
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="brand">Fabricante</Label>
                          <Input id="brand" value={formData.brand || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="tag">TAG</Label>
                          <Input id="tag" value={formData.tag || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="trellisId">Trellis ID</Label>
                          <Input id="trellisId" value={formData.trellisId || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="sizeU">Tamanho (U)</Label>
                          <Input id="sizeU" type="number" value={formData.sizeU || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={handleSelectChange}>
                              <SelectTrigger id="status"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Ativo">Ativo</SelectItem>
                                  <SelectItem value="Inativo">Inativo</SelectItem>
                                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="ownerEmail">Owner (Email)</Label>
                          <Input id="ownerEmail" type="email" value={formData.ownerEmail || ''} onChange={handleChange} />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                          <Switch id="isTagEligible" checked={!!formData.isTagEligible} onCheckedChange={handleSwitchChange('isTagEligible')} />
                          <Label htmlFor="isTagEligible">Elegível TAG</Label>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="dcRoom">Sala de DC</Label>
                          <Input id="dcRoom" value={dcRoom} readOnly disabled />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                          <Label htmlFor="dataSheetUrl">Data Sheet URL</Label>
                          <Input id="dataSheetUrl" type="url" placeholder="https://" value={formData.dataSheetUrl || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea id="description" value={formData.description || ''} onChange={handleChange} rows={3} />
                      </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                      <Label className="font-semibold">Foto do Item</Label>
                      <div className="p-2 border rounded-md bg-muted/30 min-h-[128px] flex justify-center items-center">
                          {formData.imageUrl && !cameraMode && (
                              <div className="relative group">
                                  <img src={formData.imageUrl} alt="Item Preview" className="max-h-32 object-contain rounded-md" />
                                  <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 opacity-0 group-hover:opacity-100">
                                      <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage}>
                                          <Trash2 className="mr-2" /> Remover
                                      </Button>
                                  </div>
                              </div>
                          )}
                          {!formData.imageUrl && !cameraMode && (
                              <p className="text-sm text-muted-foreground">Nenhuma imagem</p>
                          )}
                          {cameraMode && (
                              <div className="w-full">
                                  <video ref={videoRef} className="w-full rounded-md aspect-video" autoPlay playsInline muted />
                              </div>
                          )}
                      </div>
                      {cameraMode ? (
                          <div className="flex gap-2">
                              <Button type="button" className="w-full" onClick={handleCapture}>
                                  <Camera className="mr-2" />
                                  Capturar Foto
                              </Button>
                              <Button type="button" variant="outline" onClick={() => { setCameraMode(false); cleanupCamera(); }}>
                                  Cancelar
                              </Button>
                          </div>
                      ) : (
                          <div className="flex gap-2">
                              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                  <FileImage className="mr-2" />
                                  {formData.imageUrl ? "Alterar Imagem" : "Escolher Arquivo"}
                              </Button>
                              <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                              <Button type="button" variant="outline" onClick={handleUseCameraClick}>
                                  <Camera className="mr-2" />
                                  Usar Câmera
                              </Button>
                          </div>
                      )}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-muted-foreground">Controle Interno do App</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                              <Label htmlFor="width">Largura (m)</Label>
                              <Input id="width" type="number" step="0.1" value={formData.width || 0} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="length">Comprimento (m)</Label>
                              <Input id="length" type="number" step="0.1" value={formData.length || 0} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="row">Fileira</Label>
                              <Input id="row" value={formData.row || ''} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="color">Cor</Label>
                              <Input id="color" type="color" value={formData.color || '#334155'} onChange={handleChange} className="p-1 h-10" />
                          </div>
                      </div>
                  </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:w-full">
                <DeleteItemDialog item={item} onDeletionSuccess={handleDeletionSuccess} container={container}>
                    <Button variant="destructive" type="button" className="sm:mr-auto"><Trash2 className="mr-2 h-4 w-4"/> Mover para Lixeira</Button>
                </DeleteItemDialog>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    {formData.awaitingApproval && (
                      <Button variant="default" className="text-white bg-green-600 hover:bg-green-700" type="button" onClick={handleApprove}>
                          <CheckCircle2 className="mr-2 h-4 w-4"/> Aprovar
                      </Button>
                    )}
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    