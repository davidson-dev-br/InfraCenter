
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Cable, FileImage, Camera, Trash2, Video, VideoOff, CircleDot } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { ConnectableItem, EquipmentPort } from '@/lib/connection-actions';
import { createConnection } from '@/lib/connection-actions';
import { uploadImage } from '@/lib/storage-actions';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  labelText: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface AddConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  sideA: { item: ConnectableItem; port: EquipmentPort };
  sideB: { item: ConnectableItem; port: EquipmentPort };
  connectionTypeId: string;
  connectionTypeName: string;
}

export function AddConnectionDialog({ 
  isOpen, 
  onOpenChange,
  onSuccess,
  sideA, 
  sideB, 
  connectionTypeId,
  connectionTypeName 
}: AddConnectionDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { labelText: '', imageUrl: null },
    });

    const imageUrl = form.watch('imageUrl');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const dataURI = await readFileAsDataURI(file);
        if (dataURI) {
            handleUpload(dataURI, `connection-${sideA.port.id}-${sideB.port.id}.${file.type.split('/')[1]}`);
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

    const handleUpload = async (dataURI: string, blobName: string) => {
        setIsUploading(true);
        form.setValue('imageUrl', '');
        try {
            const url = await uploadImage(dataURI, blobName);
            form.setValue('imageUrl', url);
            toast({ title: 'Sucesso!', description: 'A imagem foi carregada.' });
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erro desconhecido.";
            toast({ title: 'Erro de Upload', description: msg, variant: 'destructive' });
        } finally {
            setIsUploading(false);
            if(isCameraOpen) closeCamera();
        }
    };

    const openCamera = async () => {
        setIsCameraOpen(true);
        setCameraError(null);
        setHasCameraPermission(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                setHasCameraPermission(false);
                setCameraError("Permissão para acessar a câmera foi negada. Verifique as configurações do seu navegador.");
            }
        } else {
            setHasCameraPermission(false);
            setCameraError("Seu navegador não suporta o acesso à câmera.");
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    }

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataURI = canvas.toDataURL('image/jpeg');
                handleUpload(dataURI, `conn-capture-${Date.now()}.jpg`);
            }
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            await createConnection({
                portA_id: sideA.port.id,
                portB_id: sideB.port.id,
                connectionTypeId,
                labelText: data.labelText,
                imageUrl: data.imageUrl,
            });
            toast({
                title: 'Conexão Criada!',
                description: 'A conexão com evidência foi estabelecida com sucesso.',
            });
            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao conectar',
                description: error.message,
            });
        }
    };

    useEffect(() => {
        if (!isOpen) {
            closeCamera();
            form.reset();
        }
    }, [isOpen, form]);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Conectar com Evidência</DialogTitle>
          <DialogDescription>
            Adicione detalhes e uma foto da etiqueta para auditar a conexão.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm space-y-2">
            <p><span className="font-semibold">De:</span> {sideA.item.label} / <span className="text-primary">{sideA.port.label}</span></p>
            <p><span className="font-semibold">Para:</span> {sideB.item.label} / <span className="text-primary">{sideB.port.label}</span></p>
            <p><span className="font-semibold">Tipo:</span> {connectionTypeName}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="labelText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto da Etiqueta (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite o texto que está na etiqueta física do cabo..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Evidência Fotográfica (Opcional)</FormLabel>
              <div className="relative p-2 border rounded-md bg-muted/30 min-h-[128px] w-full flex justify-center items-center group/image">
                {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : imageUrl ? (
                    <>
                    <img src={imageUrl} alt="Preview" className="max-h-48 object-contain rounded-md" data-ai-hint="cable connection"/>
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/image:opacity-100 transition-opacity" onClick={() => form.setValue('imageUrl', null)} type="button">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </>
                ) : <p className="text-sm text-muted-foreground">Nenhuma imagem</p>}
                </div>
                <div className="flex gap-2 justify-center mt-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <FileImage className="mr-2 h-4 w-4" />
                        Escolher Arquivo
                    </Button>
                    <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <Button type="button" variant="outline" onClick={openCamera} disabled={isUploading}>
                        <Camera className="mr-2 h-4 w-4" />
                        Usar Câmera
                    </Button>
                </div>
            </FormItem>


            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Conexão
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isCameraOpen} onOpenChange={closeCamera}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Capturar Imagem da Conexão</AlertDialogTitle>
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
}
