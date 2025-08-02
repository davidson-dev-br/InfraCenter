
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileImage, Camera, Trash2, Video, VideoOff, CircleDot, Palette, Server, Box } from 'lucide-react';
import { usePermissions } from '@/components/permissions-provider';
import { uploadImage } from '@/lib/storage-actions';
import { useToast } from '@/hooks/use-toast';
import type { Building, Room, GridItem } from '@/types/datacenter';
import { updateItem } from '@/lib/item-actions';
import { DeleteItemConfirmationDialog } from '@/components/delete-item-confirmation-dialog';
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// Eu poderia ter feito mais simples. Mas aí não seria tão legal.

const ChildItemsList = ({ parentId, allItems, onItemClick }: { parentId: string, allItems: GridItem[], onItemClick: (item: GridItem) => void }) => {
    const childItems = allItems.filter(item => item.parentId === parentId);

    if (childItems.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-4">
                Nenhum item aninhado neste equipamento.
            </div>
        );
    }
    
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Itens Aninhados</h4>
            <ScrollArea className="h-40">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {childItems.map(child => (
                             <TableRow key={child.id} className="cursor-pointer" onClick={() => onItemClick(child)}>
                                <TableCell>{child.label}</TableCell>
                                <TableCell><Badge variant="outline">{child.type}</Badge></TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};


const RackDiagram = ({ sizeU }: { sizeU: number | undefined }) => {
    if (!sizeU || sizeU <= 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Tamanho (U) não definido.
            </div>
        );
    }
    const units = Array.from({ length: sizeU }, (_, i) => sizeU - i);
    return (
        <div className="flex h-full border rounded-md bg-muted/20">
            <ScrollArea className="w-full p-2 space-y-1">
                {units.map((u) => (
                    <div key={u} className="flex items-center justify-center h-6 text-xs border rounded-sm bg-background">
                        <span>{u}</span>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
};

const GenericItemView = ({ item, hasPermission, onItemChange }: { item: Partial<GridItem>, hasPermission: (p: string) => boolean, onItemChange: (key: keyof GridItem, value: any) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files || e.target.files.length === 0 || !item.id) return;
     const file = e.target.files[0];
     const dataURI = await readFileAsDataURI(file);
     if (dataURI) {
       uploadDataURI(dataURI, `item-${item.id}-${Date.now()}.${file.type.split('/')[1]}`);
     }
  };
  
  const readFileAsDataURI = (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => {
              toast({ title: 'Erro de Leitura', description: 'Não foi possível ler o arquivo selecionado.', variant: 'destructive' });
              resolve(null);
          };
      });
  };

  const uploadDataURI = async (dataURI: string, blobName: string) => {
      setIsUploading(true);
      try {
          const url = await uploadImage(dataURI, blobName);
          onItemChange('imageUrl', url);
          toast({ title: 'Sucesso!', description: 'A imagem foi carregada.' });
      } catch (error) {
          const msg = error instanceof Error ? error.message : "Erro desconhecido.";
          toast({ title: 'Erro de Upload', description: msg, variant: 'destructive' });
      } finally {
          setIsUploading(false);
          setIsCameraOpen(false); // Fecha a câmera após o upload
      }
  };

  const handleRemoveImage = () => {
    onItemChange('imageUrl', null);
  }
  
  const openCamera = async () => {
      setIsCameraOpen(true);
      setCameraError(null);
      setHasCameraPermission(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
              setHasCameraPermission(true);
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
              }
          } catch (err) {
              console.error("Erro ao acessar a câmera:", err);
              setHasCameraPermission(false);
              if (err instanceof DOMException) {
                  if (err.name === "NotAllowedError") {
                      setCameraError("Permissão para acessar a câmera foi negada. Verifique as configurações do seu navegador.");
                  } else {
                       setCameraError(`Erro ao iniciar a câmera: ${err.message}`);
                  }
              } else {
                 setCameraError("Ocorreu um erro desconhecido ao tentar acessar a câmera.");
              }
          }
      } else {
          setHasCameraPermission(false);
          setCameraError("Seu navegador não suporta o acesso à câmera.");
      }
  };

  const closeCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && item.id) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURI = canvas.toDataURL('image/jpeg');
            uploadDataURI(dataURI, `item-${item.id}-capture-${Date.now()}.jpg`);
            closeCamera();
        }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 rounded-md p-4">
        <div className="relative p-2 border rounded-md bg-muted/30 min-h-[128px] w-full flex justify-center items-center mb-4 group/image">
          {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
          ) : item.imageUrl ? (
            <>
              <img src={item.imageUrl} alt="Preview" className="max-h-48 object-contain rounded-md" data-ai-hint="server rack"/>
              <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/image:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                  type="button"
                  disabled={!hasPermission('item:image:upload')}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma imagem</p>
          )}
        </div>
        {hasPermission('item:image:upload') ? (
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FileImage className="mr-2 h-4 w-4" />
              {item.imageUrl ? "Alterar Imagem" : "Escolher Arquivo"}
            </Button>
            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <Button type="button" variant="outline" onClick={openCamera} disabled={isUploading}>
              <Camera className="mr-2 h-4 w-4" />
              Usar Câmera
            </Button>
          </div>
        ) : <p className="text-xs text-muted-foreground">Você não tem permissão para carregar imagens.</p>}
      </div>

      <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Capturar Imagem</AlertDialogTitle>
          </AlertDialogHeader>
            <div className="relative w-full aspect-video bg-black rounded-md flex items-center justify-center">
                {hasCameraPermission === null && <Loader2 className="h-8 w-8 animate-spin text-white"/>}
                <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {hasCameraPermission === false && cameraError && (
                    <Alert variant="destructive" className="absolute m-4">
                        <VideoOff className="h-4 w-4" />
                        <AlertTitle>Erro na Câmera</AlertTitle>
                        <AlertDescription>{cameraError}</AlertDescription>
                    </Alert>
                )}
            </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeCamera}>Cancelar</AlertDialogCancel>
            <Button onClick={handleCapture} disabled={!hasCameraPermission || isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CircleDot className="mr-2 h-4 w-4" />}
                Tirar Foto
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const RackItemView = ({ item, hasPermission, onItemChange }: { item: Partial<GridItem>, hasPermission: (p: string) => boolean, onItemChange: (key: keyof GridItem, value: any) => void }) => {
    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className='flex-shrink-0'>
                <GenericItemView item={item} hasPermission={hasPermission} onItemChange={onItemChange} />
            </div>
            <div className="flex-grow min-h-0">
                <RackDiagram sizeU={item.tamanhoU} />
            </div>
        </div>
    )
}

interface ItemDetailDialogProps {
  item: GridItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdate: (item: GridItem) => void;
  onItemDelete: (itemId: string) => void;
  fullItemContext: {
    currentBuilding?: Building;
    availableRooms?: Room[];
    activeRoomId?: string | null;
    allItems: GridItem[];
  };
}

export const ItemDetailDialog = ({ item, open, onOpenChange, onItemUpdate, onItemDelete, fullItemContext }: ItemDetailDialogProps) => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<Partial<GridItem>>({});
  const [availableStatuses, setAvailableStatuses] = React.useState<ItemStatus[]>([]);
  
  const isRackType = editFormData.type?.toLowerCase().includes('rack');

  React.useEffect(() => {
    if (item) {
      setEditFormData({
        ...item,
        tamanhoU: item.type?.toLowerCase().includes('rack') ? item.tamanhoU || 42 : undefined,
      });
    }
  }, [item]);

  React.useEffect(() => {
    if (open) {
        getItemStatuses().then(setAvailableStatuses);
    }
  }, [open])

  const handleFormChange = (key: keyof GridItem, value: any) => {
     setEditFormData(prev => ({...prev, [key]: value}))
  }

  const handleEditSave = async () => {
    setIsSaving(true);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, itemTypeColor, roomName, buildingName, parentName, ...updateData } = editFormData;

    try {
      await updateItem({ id: item.id, ...updateData });
      onItemUpdate({ ...item, ...updateData } as GridItem);
      onOpenChange(false);
      toast({ title: "Item Atualizado", description: `O item ${editFormData.label} foi salvo.` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({ variant: "destructive", title: "Erro ao Salvar", description: msg });
    } finally {
      setIsSaving(false);
    }
  };
  
  const canDeleteItem = (
    (item.status === 'draft' && hasPermission('item:delete:draft')) ||
    (item.status !== 'draft' && hasPermission('item:decommission:active'))
  );

  const currentRoom = fullItemContext.availableRooms?.find(r => r.id === item.roomId);
  const currentBuilding = fullItemContext.currentBuilding;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Item: {editFormData.label}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollArea className="h-[60vh] p-4 md:col-span-2">
              <div className="grid gap-4 py-4 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="label">Nome</Label>
                        <Input id="label" value={editFormData.label || ''} onChange={(e) => handleFormChange('label', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="modelo">Modelo</Label>
                        <Input id="modelo" value={editFormData.modelo || ''} onChange={(e) => handleFormChange('modelo', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Input id="type" value={editFormData.type} readOnly disabled />
                    </div>
                    <div>
                        <Label htmlFor="preco">Preço</Label>
                        <Input id="preco" type="number" value={editFormData.preco || ''} onChange={(e) => handleFormChange('preco', e.target.valueAsNumber)} />
                    </div>
                    <div>
                        <Label htmlFor="serialNumber">Serial</Label>
                        <Input id="serialNumber" value={editFormData.serialNumber || ''} onChange={(e) => handleFormChange('serialNumber', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="brand">Fabricante</Label>
                        <Input id="brand" value={editFormData.brand || ''} onChange={(e) => handleFormChange('brand', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="tag">TAG</Label>
                        <Input id="tag" value={editFormData.tag || ''} onChange={(e) => handleFormChange('tag', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="trellisId">TrellisId</Label>
                        <Input id="trellisId" value={editFormData.trellisId || ''} onChange={(e) => handleFormChange('trellisId', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="tamanhoU">Tamanho (U)</Label>
                        <Input id="tamanhoU" type="number" value={editFormData.tamanhoU || ''} onChange={(e) => handleFormChange('tamanhoU', e.target.valueAsNumber)} disabled={!isRackType} />
                    </div>
                    <div>
                        <Label htmlFor="potenciaW">Potência (W)</Label>
                        <Input id="potenciaW" type="number" value={editFormData.potenciaW || ''} onChange={(e) => handleFormChange('potenciaW', e.target.valueAsNumber)} />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={editFormData.status} onValueChange={(value) => handleFormChange('status', value)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(status => (
                                    <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                          <Label htmlFor="roomName">Sala</Label>
                          <Input id="roomName" value={`${currentBuilding?.name || item.buildingName} / ${currentRoom?.name || item.roomName}`} readOnly disabled />
                      </div>
                    <div>
                        <Label htmlFor="ownerEmail">Owner (Email)</Label>
                        <Input id="ownerEmail" type="email" value={editFormData.ownerEmail || ''} onChange={(e) => handleFormChange('ownerEmail', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="isTagEligible" checked={!!editFormData.isTagEligible} onCheckedChange={(checked) => handleFormChange('isTagEligible', checked)}/>
                            <Label htmlFor="isTagEligible">Elegível TAG</Label>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Label htmlFor="color">Cor</Label>
                            <Input id="color" type="color" value={editFormData.color || '#ffffff'} onChange={(e) => handleFormChange('color', e.target.value)} className="w-16 p-1"/>
                        </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="dataSheetUrl">Data Sheet URL</Label>
                      <Input id="dataSheetUrl" type="url" placeholder="https://" value={editFormData.dataSheetUrl || ''} onChange={(e) => handleFormChange('dataSheetUrl', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" value={editFormData.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} rows={3} />
                  </div>
                  {isRackType && (
                     <ChildItemsList 
                        parentId={item.id} 
                        allItems={fullItemContext.allItems}
                        onItemClick={(childItem) => {
                            // Ao clicar em um filho, trocamos o item no modal
                            setEditFormData(childItem);
                        }}
                     />
                  )}
              </div>
            </ScrollArea>
            <div className="md:col-span-1 h-[60vh]">
                 {isRackType ? (
                    <RackItemView item={editFormData} hasPermission={hasPermission} onItemChange={handleFormChange} />
                 ) : (
                    <GenericItemView item={editFormData} hasPermission={hasPermission} onItemChange={handleFormChange} />
                 )}
            </div>
          </div>
          <DialogFooter className='justify-between'>
            <div>
              {canDeleteItem && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isSaving}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {item.status === 'draft' ? 'Excluir Rascunho' : 'Descomissionar'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
              <Button onClick={handleEditSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {item && (
        <DeleteItemConfirmationDialog
          item={item}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={(hardDelete) => {
            onItemDelete(item.id);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
};
