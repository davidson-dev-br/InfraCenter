
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, BrainCircuit, Bot, Sparkles, Loader2, Check, Copy } from "lucide-react";
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
    const { toast } = useToast();

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ExtractConnectionOutput | null>(null);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [correctedData, setCorrectedData] = useState<ExtractConnectionOutput | null>(null);

    const cleanupCamera = () => {
        if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
            videoStreamRef.current = null;
        }
    };
    
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
    }, [toast]);

    const handleAnalyzeFrame = async () => {
        if (!videoRef.current) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast({ variant: "destructive", title: "Erro de Captura" });
            setIsAnalyzing(false);
            return;
        }
        
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const capturedUri = canvas.toDataURL('image/jpeg');

        try {
            const resizedUri = await resizeImage(capturedUri);
            setCapturedImage(resizedUri);
            const result = await analyzeCableLabelImage({ photoDataUri: resizedUri });
            setAnalysisResult(result);
            setCorrectedData(result);
            setIsCorrectionModalOpen(true);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro na Análise", description: "Não foi possível analisar a imagem." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveCorrection = async () => {
        if (!capturedImage || !correctedData) return;
        setIsSaving(true);
        try {
            await saveLabelCorrection({
                imageDataUri: capturedImage,
                correctedData: correctedData,
            });
            toast({
                title: "Correção Salva!",
                description: "A IA usará este exemplo para aprender e melhorar."
            });
            setIsCorrectionModalOpen(false);
            setAnalysisResult(null);
            setCapturedImage(null);
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
                            <CardDescription>Treine a máquina para ler etiquetas de cabos. Aponte a câmera, analise, corrija e salve. Cada correção melhora a precisão da IA.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative w-full bg-black rounded-lg aspect-video">
                        <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline muted />
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
                                    <AlertDescription>Não foi possível acessar a câmera. Verifique as permissões do seu navegador.</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handleAnalyzeFrame}
                        disabled={!hasCameraPermission || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5 mr-2" />
                        )}
                        {isAnalyzing ? 'Analisando...' : 'Analisar Frame do Vídeo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">Clique para capturar um quadro do vídeo e deixar a IA analisá-lo.</p>
                </CardFooter>
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
                            <Label>Imagem Capturada</Label>
                            <div className="p-2 border rounded-md bg-muted/30">
                                {capturedImage && <img src={capturedImage} alt="Captured label" className="rounded-md" />}
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
