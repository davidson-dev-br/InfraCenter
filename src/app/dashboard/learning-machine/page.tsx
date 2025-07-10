
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, BrainCircuit, Bot, Sparkles, Loader2, Check, Copy, Play, XCircle, List, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { analyzeCableLabelImage, saveLabelCorrection } from '@/ai/flows/learning-machine-flow';
import type { ExtractConnectionOutput } from '@/ai/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiscoveredLabel {
    id: string; // Will use the main label text as a unique ID
    fullText: string; // The full text read from the label
    analysis: ExtractConnectionOutput;
    count: number;
}

const MAX_IMAGE_DIMENSION = 1024;
const resizeImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > height) { if (width > MAX_IMAGE_DIMENSION) { height *= MAX_IMAGE_DIMENSION / width; width = MAX_IMAGE_DIMENSION; } } 
            else { if (height > MAX_IMAGE_DIMENSION) { width *= MAX_IMAGE_DIMENSION / height; height = MAX_IMAGE_DIMENSION; } }
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

export default function LearningMachinePage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [discoveredLabels, setDiscoveredLabels] = useState<Record<string, DiscoveredLabel>>({});
    const [capturedImageForCorrection, setCapturedImageForCorrection] = useState<string | null>(null);
    const [labelForCorrection, setLabelForCorrection] = useState<DiscoveredLabel | null>(null);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [correctedData, setCorrectedData] = useState<ExtractConnectionOutput | null>(null);

    const cleanupCamera = useCallback(() => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
            videoStreamRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setHasCameraPermission(false);
                toast({ variant: 'destructive', title: 'Câmera não suportada', description: 'Seu navegador não suporta acesso à câmera.' });
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
            }
        };
        getCameraPermission();
        return () => cleanupCamera();
    }, [toast, cleanupCamera]);

    const startAnalysisLoop = () => {
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        setIsAnalyzing(true);

        analysisIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
            
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const capturedUri = canvas.toDataURL('image/jpeg');

            try {
                const resizedUri = await resizeImage(capturedUri);
                const result = await analyzeCableLabelImage({ photoDataUri: resizedUri });

                const id = result.cableLabel || result.sourceHostname || result.destinationHostname;
                if(id) {
                     const fullText = [result.cableLabel, result.sourceHostname, result.sourcePort, result.destinationHostname, result.destinationPort].filter(Boolean).join(' ');
                     setDiscoveredLabels(prev => {
                         const existing = prev[id];
                         return {
                             ...prev,
                             [id]: {
                                 id,
                                 fullText: fullText,
                                 analysis: result,
                                 count: existing ? existing.count + 1 : 1
                             }
                         }
                     })
                }

            } catch (error) {
                console.warn("Analysis loop error:", error);
            }
        }, 2000); // Analyze every 2 seconds
    };

    const stopAnalysisLoop = () => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        setIsAnalyzing(false);
    };

    const handleOpenCorrectionModal = (label: DiscoveredLabel) => {
        setLabelForCorrection(label);
        setCorrectedData(label.analysis);
        // We need a static image for the modal, so we capture one last frame.
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                setCapturedImageForCorrection(canvas.toDataURL('image/jpeg'));
            }
        }
        setIsCorrectionModalOpen(true);
    };

    const handleSaveCorrection = async () => {
        if (!capturedImageForCorrection || !correctedData || !labelForCorrection) return;
        setIsSaving(true);
        try {
            await saveLabelCorrection({
                imageDataUri: capturedImageForCorrection,
                correctedData: correctedData,
            });
            toast({
                title: "Correção Salva!",
                description: "A IA usará este exemplo para aprender e melhorar."
            });
            // Remove the corrected label from the discovered list
            setDiscoveredLabels(prev => {
                const newLabels = { ...prev };
                delete newLabels[labelForCorrection.id];
                return newLabels;
            });
            setIsCorrectionModalOpen(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível salvar a correção." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCorrectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!correctedData) return;
        const { id, value } = e.target;
        setCorrectedData({ ...correctedData, [id]: value });
    };

    const handleCopyResult = () => {
        if (!correctedData) return;
        navigator.clipboard.writeText(JSON.stringify(correctedData, null, 2));
        toast({ title: "Resultado copiado para a área de transferência!" });
    };

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <BrainCircuit className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline">Laboratório de Treinamento de IA</CardTitle>
                            <CardDescription>Inicie a análise para a IA ler etiquetas em tempo real. Clique em uma etiqueta descoberta para corrigir e ensinar o modelo.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Coluna da Câmera */}
                    <div className="space-y-4">
                        <div className="relative w-full bg-black rounded-lg aspect-video">
                            <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline muted />
                             {isAnalyzing && (
                                <div className="absolute top-2 left-2 flex items-center gap-2 p-2 text-white bg-black/50 rounded-lg">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <span>Analisando...</span>
                                </div>
                            )}
                            {hasCameraPermission === null && (
                                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                                    <Loader2 className="w-8 h-8 mr-2 animate-spin" />
                                    Acessando câmera...
                                </div>
                            )}
                            {hasCameraPermission === false && (
                                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                                    <Alert variant="destructive" className="max-w-md">
                                        <AlertTitle>Câmera Indisponível</AlertTitle>
                                        <AlertDescription>Não foi possível acessar a câmera. Verifique as permissões.</AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4">
                           <Button onClick={isAnalyzing ? stopAnalysisLoop : startAnalysisLoop} size="lg" disabled={!hasCameraPermission} className={isAnalyzing ? 'bg-destructive hover:bg-destructive/90' : ''}>
                               {isAnalyzing ? (
                                   <>
                                    <XCircle className="w-5 h-5 mr-2" /> Parar Análise
                                   </>
                               ) : (
                                   <>
                                     <Play className="w-5 h-5 mr-2" /> Iniciar Análise
                                   </>
                               )}
                           </Button>
                        </div>
                    </div>
                     {/* Coluna da Captura/Análise */}
                     <div className="space-y-4">
                        <Card>
                            <CardHeader className='pb-2'>
                                <CardTitle className="flex items-center gap-2"><List /> Etiquetas Descobertas</CardTitle>
                                <CardDescription>A lista será preenchida conforme a IA identifica etiquetas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                   <div className="space-y-2">
                                    {Object.keys(discoveredLabels).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                                            <Bot className="w-12 h-12 mx-auto mb-2" />
                                            <p>Aguardando detecção de etiquetas...</p>
                                        </div>
                                    ) : (
                                       Object.values(discoveredLabels).map(label => (
                                           <div key={label.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50">
                                               <div className='truncate'>
                                                    <p className='font-mono text-sm font-semibold truncate' title={label.fullText}>{label.fullText}</p>
                                                    <p className='text-xs text-muted-foreground'>Visto {label.count}x</p>
                                               </div>
                                                <Button size="sm" variant="outline" onClick={() => handleOpenCorrectionModal(label)}>
                                                    <Edit className="w-4 h-4 mr-2" /> Corrigir
                                                </Button>
                                           </div>
                                       ))
                                    )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isCorrectionModalOpen} onOpenChange={setIsCorrectionModalOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <Bot className="w-6 h-6" /> Resultado da Análise e Correção
                        </DialogTitle>
                        <DialogDescription>
                            A IA extraiu estas informações da imagem. Corrija o que for necessário e salve para ensinar o modelo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <Label>Imagem de Referência</Label>
                            <div className="p-2 border rounded-md bg-muted/30">
                                {capturedImageForCorrection && <img src={capturedImageForCorrection} alt="Captured label" className="rounded-md" />}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label>Dados Extraídos (Editáveis)</Label>
                            <div className="space-y-2">
                                <Label htmlFor="cableLabel" className="text-xs">Etiqueta do Cabo</Label>
                                <Input id="cableLabel" value={correctedData?.cableLabel || ''} onChange={handleCorrectionChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sourceHostname" className="text-xs">Hostname de Origem</Label>
                                <Input id="sourceHostname" value={correctedData?.sourceHostname || ''} onChange={handleCorrectionChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sourcePort" className="text-xs">Porta de Origem</Label>
                                <Input id="sourcePort" value={correctedData?.sourcePort || ''} onChange={handleCorrectionChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destinationHostname" className="text-xs">Hostname de Destino</Label>
                                <Input id="destinationHostname" value={correctedData?.destinationHostname || ''} onChange={handleCorrectionChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="destinationPort" className="text-xs">Porta de Destino</Label>
                                <Input id="destinationPort" value={correctedData?.destinationPort || ''} onChange={handleCorrectionChange} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                         <Button type="button" variant="ghost" onClick={handleCopyResult}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar JSON
                        </Button>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleSaveCorrection} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Salvar Correção e Ensinar IA
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
