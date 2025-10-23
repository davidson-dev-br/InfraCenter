"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Camera, FileImage, Download, Loader2, ArrowLeft, Maximize } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { extractConnectionDetails } from '@/ai/flows/extract-connection-details-flow';
import { ConnectionDialog } from './connection-dialog';
import type { Connection } from '@/lib/types';
import { useInfra } from '../datacenter-switcher';

type IAConnectionDialogProps = {
  children: React.ReactNode;
};

const MAX_IMAGE_DIMENSION = 1024;

export function IAConnectionDialog({ children }: IAConnectionDialogProps) {
  const { equipment } = useInfra();
  const [isIaOpen, setIsIaOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'camera' | 'preview' | 'loading'>('select');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLargePreviewOpen, setIsLargePreviewOpen] = useState(false);
  
  const [initialFormData, setInitialFormData] = useState<Partial<Connection> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const cleanupCamera = () => {
    if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
    }
  };

  const resetAllState = () => {
    cleanupCamera();
    setStep('select');
    setImageDataUri(null);
    setHasCameraPermission(null);
    setInitialFormData(null);
  }

  useEffect(() => {
    if (!isIaOpen && !isFormOpen) {
      resetAllState();
    }
  }, [isIaOpen, isFormOpen]);

  useEffect(() => {
    if (step === 'camera' && isIaOpen) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setHasCameraPermission(false);
            toast({ variant: 'destructive', title: 'Câmera não suportada', description: 'Seu navegador não suporta acesso à câmera.' });
            setStep('select');
            return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          videoStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Acesso à Câmera Negado', description: 'Habilite a permissão nas configurações do seu navegador.' });
          setStep('select');
        }
      };
      getCameraPermission();
    } else {
      cleanupCamera();
    }
    return () => {
      if (step !== 'camera') {
        cleanupCamera();
      }
    };
  }, [step, isIaOpen, toast]);
  
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          try {
            const resizedUri = await resizeImage(event.target.result);
            setImageDataUri(resizedUri);
            setStep('preview');
          } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao processar imagem', description: 'O arquivo pode estar corrompido.' });
          }
        }
      };
      reader.readAsDataURL(file);
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
              setImageDataUri(resizedUri);
              setStep('preview');
            } catch (error) {
              toast({ variant: 'destructive', title: 'Erro ao capturar imagem' });
            }
        }
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri) return;
    setStep('loading');
    try {
      const result = await extractConnectionDetails({ photoDataUri: imageDataUri });
      
      const sourceEquipment = equipment.find(eq => eq.hostname === result.sourceHostname);
      const destinationEquipment = equipment.find(eq => eq.hostname === result.destinationHostname);

      const newConnectionData: Partial<Connection> = {
        cableLabel: result.cableLabel || '',
        sourceEquipmentId: sourceEquipment?.id || '',
        sourcePort: result.sourcePort || '',
        destinationEquipmentId: destinationEquipment?.id || '',
        destinationPort: result.destinationPort || '',
      };
      
      // If AI couldn't parse structured data but found some text, put it all in the label.
      const allText = [result.cableLabel, result.sourceHostname, result.sourcePort, result.destinationHostname, result.destinationPort].filter(Boolean).join(' ');
      if (allText && !sourceEquipment && !destinationEquipment) {
          newConnectionData.cableLabel = allText;
          newConnectionData.sourcePort = '';
      }

      if (!sourceEquipment?.id && result.sourceHostname) {
          toast({ variant: 'destructive', title: 'Atenção', description: `Equipamento de origem "${result.sourceHostname}" não encontrado.` });
      }
      if (!destinationEquipment?.id && result.destinationHostname) {
          toast({ variant: 'destructive', title: 'Atenção', description: `Equipamento de destino "${result.destinationHostname}" não encontrado.` });
      }

      setInitialFormData(newConnectionData);
      setIsFormOpen(true);
      setIsIaOpen(false);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast({ variant: 'destructive', title: 'Análise Falhou', description: 'Não foi possível extrair detalhes da imagem. Tente novamente.' });
      setStep('preview');
    }
  };

  const handleBack = () => {
    setImageDataUri(null);
    setStep('select');
  };

  return (
    <>
      <Dialog open={isIaOpen} onOpenChange={setIsIaOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent onInteractOutside={(e) => { if (step === 'loading') e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>Adicionar Conexão com Etiqueta (IA)</DialogTitle>
            <DialogDescription>
              {step === 'select' && 'Escolha uma fonte para a foto da etiqueta do cabo.'}
              {step === 'camera' && 'Posicione a câmera para capturar a etiqueta.'}
              {step === 'preview' && 'Verifique a imagem e prossiga para a análise com IA.'}
              {step === 'loading' && 'Analisando a imagem... Por favor, aguarde.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {step === 'select' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => fileInputRef.current?.click()}>
                  <FileImage className="w-8 h-8" />
                  Escolher da Galeria
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => setStep('camera')}>
                  <Camera className="w-8 h-8" />
                  Usar Câmera
                </Button>
              </div>
            )}

            {step === 'camera' && (
              <div className="space-y-4">
                <div className="relative w-full bg-black rounded-md aspect-video">
                  <video ref={videoRef} className="w-full h-full" autoPlay playsInline muted />
                </div>
                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                      <AlertTitle>Acesso à Câmera Negado</AlertTitle>
                      <AlertDescription>Habilite a permissão nas configurações do seu navegador.</AlertDescription>
                    </Alert>
                )}
                 <Button className="w-full" onClick={handleCapture} disabled={!hasCameraPermission}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar Foto
                </Button>
              </div>
            )}

            {(step === 'preview' || step === 'loading') && imageDataUri && (
                <div className="space-y-4">
                    <div className="relative border-2 border-dashed rounded-md aspect-video">
                        <img src={imageDataUri} alt="Cable label preview" className="object-contain w-full h-full rounded-md" />
                        <Button variant="outline" size="icon" className="absolute top-2 right-2 bg-background/50 hover:bg-background/80" onClick={() => setIsLargePreviewOpen(true)}>
                           <Maximize className="w-4 h-4" />
                           <span className="sr-only">Preview Image</span>
                        </Button>
                    </div>
                </div>
            )}
             {step === 'loading' && (
                <div className="flex items-center justify-center p-8 space-x-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-lg font-medium">Analisando etiqueta...</p>
                </div>
            )}
          </div>

          <DialogFooter className="flex-wrap justify-between gap-2">
            <div>
              {(step === 'camera' || step === 'preview') && (
                  <Button variant="ghost" onClick={handleBack} disabled={step === 'loading'}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                  </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step === 'preview' && (
                <Button onClick={handleAnalyze}>Analisar com IA</Button>
              )}
              {step === 'loading' && (
                  <Button disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                  </Button>
              )}
              {(step === 'select' || step === 'camera') && <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLargePreviewOpen} onOpenChange={setIsLargePreviewOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader><DialogTitle>Visualização da Imagem</DialogTitle></DialogHeader>
              <div className="p-4">
                  <img src={imageDataUri || ''} alt="Large cable label preview" className="w-full h-auto max-h-[70vh] object-contain rounded-md" />
              </div>
              <DialogFooter>
                  <a href={imageDataUri || ''} download={`cable-label-${Date.now()}.jpg`} className="w-full sm:w-auto">
                    <Button className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Imagem
                    </Button>
                  </a>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {initialFormData && (
        <ConnectionDialog 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen}
          initialData={initialFormData}
        />
      )}
    </>
  );
}
