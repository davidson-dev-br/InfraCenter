

"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import type { Equipment } from "@/lib/types";
import { useInfra } from "../datacenter-switcher";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Camera, FileImage, Trash2 } from 'lucide-react';

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

type EquipamentoDialogProps = {
  children?: React.ReactNode;
  equipamento?: Equipment;
  initialData?: Partial<Equipment>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: () => void;
};

const getDefaultFormData = (): Omit<Equipment, 'id'> => ({
  hostname: '',
  model: '',
  price: 0,
  serialNumber: '',
  entryDate: '',
  type: '',
  brand: '',
  tag: '',
  description: '',
  sizeU: '',
  trellisId: '',
  positionU: '',
  ownerEmail: '',
  isTagEligible: false,
  isFrontFacing: true,
  status: '',
  parentItemId: '',
  dataSheetUrl: '',
  imageUrl: '',
});

export function EquipamentoDialog({ children, equipamento, initialData, open: openProp, onOpenChange: onOpenChangeProp, onSaveSuccess }: EquipamentoDialogProps) {
  const {
    buildings,
    itemsByRoom,
    systemSettings,
    addEquipment,
    updateEquipment
  } = useInfra();
  const { equipmentTypes, equipmentStatuses } = systemSettings;
  const { toast } = useToast();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = openProp ?? internalOpen;
  const setIsOpen = onOpenChangeProp ?? setInternalOpen;

  const [cameraMode, setCameraMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const isEditMode = !!equipamento;

  const parentItems = useMemo(() => 
    Object.values(itemsByRoom).flat().filter(item => item.type.toLowerCase().includes('rack')),
    [itemsByRoom]
  );

  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>(getDefaultFormData());

  const cleanupCamera = () => {
    if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCameraMode(false);
      if (isEditMode && equipamento) {
        setFormData({
            ...getDefaultFormData(),
            ...equipamento
        });
      } else {
        setFormData({
            ...getDefaultFormData(),
            ...initialData,
            type: initialData?.type || (equipmentTypes.length > 0 ? equipmentTypes[0].name : ''),
            status: initialData?.status || (equipmentStatuses.length > 0 ? equipmentStatuses[0].name : ''),
            parentItemId: initialData?.parentItemId || (parentItems.length > 0 ? parentItems[0].id : ''),
        });
      }
    }
  }, [isOpen, equipamento, isEditMode, initialData, systemSettings, parentItems]);
  
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
    setFormData(prev => ({ ...prev, [id]: isNumber ? parseFloat(value) : value }));
  };

  const handleSelectChange = (id: 'type' | 'parentItemId' | 'status') => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: 'isTagEligible' | 'isFrontFacing') => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      imageUrl: formData.imageUrl || null,
      brand: formData.brand || null,
      model: formData.model || null,
      serialNumber: formData.serialNumber || null,
      entryDate: formData.entryDate || null,
      tag: formData.tag || null,
      description: formData.description || null,
      sizeU: formData.sizeU || null,
      trellisId: formData.trellisId || null,
      positionU: formData.positionU || null,
      ownerEmail: formData.ownerEmail || null,
      status: formData.status || null,
      parentItemId: formData.parentItemId || null,
      dataSheetUrl: formData.dataSheetUrl || null,
    };

    if (isEditMode && equipamento) {
      updateEquipment({ ...equipamento, ...dataToSave });
    } else {
      addEquipment(dataToSave);
    }
    setIsOpen(false);
    onSaveSuccess?.();
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
    setFormData(prev => ({...prev, imageUrl: ''}));
  };

  const dcRoom = useMemo(() => {
    if (!formData.parentItemId) return 'N/A';

    for (const [roomId, items] of Object.entries(itemsByRoom)) {
      if (items.some(item => item.id === formData.parentItemId)) {
        for (const building of buildings) {
          const room = building.rooms.find(r => r.id === roomId);
          if (room) {
            return `${building.name} / ${room.name}`;
          }
        }
      }
    }
    return 'N/A';
  }, [formData.parentItemId, buildings, itemsByRoom]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Equipamento' : 'Adicionar Equipamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do seu ativo de hardware.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[65vh] p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input id="hostname" value={formData.hostname} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={formData.model || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input id="price" type="number" value={formData.price} onChange={handleChange} />
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
                <Select value={formData.type} onValueChange={handleSelectChange('type')}>
                  <SelectTrigger id="type"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Fabricante</Label>
                <Input id="brand" value={formData.brand || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">TAG</Label>
                <Input id="tag" value={formData.tag || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={formData.description || ''} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizeU">Tamanho (U)</Label>
                <Input id="sizeU" value={formData.sizeU || ''} onChange={handleChange} placeholder="Ex: 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trellisId">Trellis ID</Label>
                <Input id="trellisId" value={formData.trellisId || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionU">Posição (U)</Label>
                <Input id="positionU" value={formData.positionU || ''} onChange={handleChange} placeholder="Ex: 39 ou 20-29" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner (Email)</Label>
                <Input id="ownerEmail" type="email" value={formData.ownerEmail || ''} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="isTagEligible" checked={formData.isTagEligible} onCheckedChange={handleSwitchChange('isTagEligible')} />
                <Label htmlFor="isTagEligible">Elegível TAG</Label>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="isFrontFacing" checked={formData.isFrontFacing} onCheckedChange={handleSwitchChange('isFrontFacing')} />
                <Label htmlFor="isFrontFacing">Front Facing</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ''} onValueChange={handleSelectChange('status')}>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipmentStatuses.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentItemId">Cabinet</Label>
                <Select value={formData.parentItemId || ''} onValueChange={handleSelectChange('parentItemId')}>
                  <SelectTrigger id="parentItemId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {parentItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="dcRoom">Sala de DC</Label>
                <Input id="dcRoom" value={dcRoom} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataSheetUrl">Data Sheet</Label>
                <Input id="dataSheetUrl" value={formData.dataSheetUrl || ''} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Imagem do Equipamento</Label>
                <div className="p-2 border rounded-md bg-muted/30 min-h-[128px] flex justify-center items-center">
                    {formData.imageUrl && !cameraMode && (
                        <div className="relative group">
                            <img src={formData.imageUrl} alt="Equipment Preview" className="max-h-32 object-contain rounded-md" />
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
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            </DialogClose>
            <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
