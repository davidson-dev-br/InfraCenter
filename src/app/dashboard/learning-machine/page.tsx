
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, BrainCircuit, Bot, Sparkles, Loader2, Check, Copy, Play, XCircle, List, Edit, BookOpen, Save } from "lucide-react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface DiscoveredLabel {
    id: string; 
    fullText: string;
    analysis: ExtractConnectionOutput;
    imageDataUri: string; // Keep a reference image for each unique label
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

type TrainingSessionModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    discoveredLabels: Record<string, DiscoveredLabel>;
    onSaveAll: (corrections: Record<string, ExtractConnectionOutput>) => Promise<void>;
};

function TrainingSessionModal({ isOpen, onOpenChange, discoveredLabels, onSaveAll }: TrainingSessionModalProps) {
    const [corrections, setCorrections] = useState<Record<string, ExtractConnectionOutput>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialCorrections = Object.entries(discoveredLabels).reduce((acc, [id, label]) => {
                acc[id] = label.analysis;
                return acc;
            }, {} as Record<string, ExtractConnectionOutput>);
            setCorrections(initialCorrections);
        }
    }, [isOpen, discoveredLabels]);

    const handleCorrectionChange = (labelId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCorrections(prev => ({
            ...prev,
            [labelId]: {
                ...prev[labelId],
                [id]: value
            }
        }));
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSaveAll(corrections);
        setIsSaving(false);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BookOpen className="w-6 h-6" />
                        Sessão de Treinamento de Etiquetas
                    </DialogTitle>
                    <DialogDescription>
                        Revise e corrija as informações extraídas pela IA para cada etiqueta descoberta. Suas correções ajudarão a melhorar o modelo.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow pr-6 -mr-6">
                    <div className="space-y-6">
                       {Object.values(discoveredLabels).map(label => (
                           <div key={label.id}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                        <Label>Imagem de Referência</Label>
                                        <img src={label.imageDataUri} alt={`Preview for ${label.id}`} className="rounded-md border p-1" />
                                        <p className='text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md'>Texto Lido: {label.fullText}</p>
                                   </div>
                                   <div className="space-y-3">
                                        <Label>Dados Extraídos (Editáveis)</Label>
                                        <div>
                                            <Label htmlFor="cableLabel" className="text-xs">Etiqueta do Cabo</Label>
                                            <Input id="cableLabel" value={corrections[label.id]?.cableLabel || ''} onChange={(e) => handleCorrectionChange(label.id, e)} />
                                        </div>
                                         <div>
                                            <Label htmlFor="sourceHostname" className="text-xs">Hostname Origem</Label>
                                            <Input id="sourceHostname" value={corrections[label.id]?.sourceHostname || ''} onChange={(e) => handleCorrectionChange(label.id, e)} />
                                        </div>
                                         <div>
                                            <Label htmlFor="sourcePort" className="text-xs">Porta Origem</Label>
                                            <Input id="sourcePort" value={corrections[label.id]?.sourcePort || ''} onChange={(e) => handleCorrectionChange(label.id, e)} />
                                        </div>
                                         <div>
                                            <Label htmlFor="destinationHostname" className="text-xs">Hostname Destino</Label>
                                            <Input id="destinationHostname" value={corrections[label.id]?.destinationHostname || ''} onChange={(e) => handleCorrectionChange(label.id, e)} />
                                        </div>
                                        <div>
                                            <Label htmlFor="destinationPort" className="text-xs">Porta Destino</Label>
                                            <Input id="destinationPort" value={corrections[label.id]?.destinationPort || ''} onChange={(e) => handleCorrectionChange(label.id, e)} />
                                        </div>
                                   </div>
                               </div>
                               <Separator className="mt-6" />
                           </div>
                       ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Todas as Correções
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function LearningMachinePage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [discoveredLabels, setDiscoveredLabels] = useState<Record<string, DiscoveredLabel>>({});
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

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
        setDiscoveredLabels({}); // Clear previous results
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
                                 imageDataUri: resizedUri, // Update with the latest image
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

    const handleSaveAllCorrections = async (corrections: Record<string, ExtractConnectionOutput>) => {
        let savedCount = 0;
        const totalCount = Object.keys(corrections).length;
        
        const promises = Object.entries(corrections).map(async ([id, correctedData]) => {
            const originalLabel = discoveredLabels[id];
            if (!originalLabel) return;
            try {
                await saveLabelCorrection({
                    imageDataUri: originalLabel.imageDataUri,
                    correctedData: correctedData,
                });
                savedCount++;
            } catch (error) {
                console.error(`Failed to save correction for ${id}:`, error);
            }
        });
        
        await Promise.all(promises);

        if (savedCount > 0) {
            toast({
                title: "Correções Salvas!",
                description: `${savedCount} de ${totalCount} etiquetas foram salvas como exemplos para a IA.`
            });
        }

        if (savedCount < totalCount) {
             toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: `${totalCount - savedCount} correções não puderam ser salvas.`
            });
        }
        
        setDiscoveredLabels({}); // Clear the list after saving
    };


    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <BrainCircuit className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline">Laboratório de Treinamento de IA</CardTitle>
                            <CardDescription>Inicie a análise para a IA ler etiquetas em tempo real. Depois, revise e treine as etiquetas descobertas.</CardDescription>
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
                                            <p>{isAnalyzing ? "Analisando..." : "Aguardando detecção de etiquetas..."}</p>
                                        </div>
                                    ) : (
                                       Object.values(discoveredLabels).map(label => (
                                           <div key={label.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                                               <div className='truncate'>
                                                    <p className='font-mono text-sm font-semibold truncate' title={label.fullText}>{label.fullText}</p>
                                                    <p className='text-xs text-muted-foreground'>Visto {label.count}x</p>
                                               </div>
                                           </div>
                                       ))
                                    )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={Object.keys(discoveredLabels).length === 0 || isAnalyzing}
                            onClick={() => setIsTrainingModalOpen(true)}
                        >
                            <Edit className="w-5 h-5 mr-2" />
                            Revisar e Treinar {Object.keys(discoveredLabels).length > 0 ? `(${Object.keys(discoveredLabels).length})` : ''}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <TrainingSessionModal
                isOpen={isTrainingModalOpen}
                onOpenChange={setIsTrainingModalOpen}
                discoveredLabels={discoveredLabels}
                onSaveAll={handleSaveAllCorrections}
            />
        </div>
    );
}

    