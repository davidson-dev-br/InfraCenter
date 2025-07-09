
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProfileDialogProps = {
    children: React.ReactNode;
}

export function ProfileDialog({ children }: ProfileDialogProps) {
    const { userData } = useAuth();
    const { updateUser } = useInfra();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>("");
    const [signatureUrl, setSignatureUrl] = useState<string | null>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userData) {
            setName(userData.name);
            setAvatarUrl(userData.avatarUrl || null);
            setSignatureUrl(userData.signatureUrl || null);
        }
    }, [isOpen, userData]);

    const getInitials = (nameStr: string = '') => {
        if (!nameStr) return 'U';
        return nameStr
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!userData) return;
        setIsLoading(true);
        try {
            await updateUser({
                ...userData,
                name: name,
                avatarUrl: avatarUrl,
                signatureUrl: signatureUrl,
            });
            toast({ title: "Perfil Atualizado", description: "Suas informações foram salvas com sucesso."});
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o perfil."});
        } finally {
            setIsLoading(false);
        }
    };

    const formatRoleName = (role: string) => {
        if (!role) return '';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Meu Perfil</DialogTitle>
                    <DialogDescription>Atualize suas informações pessoais e avatar.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                           <AvatarImage src={avatarUrl || ''} alt={name} />
                           <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                             <Label htmlFor="avatar-upload-dialog">Alterar Avatar</Label>
                             <Input id="avatar-upload-dialog" type="file" accept="image/*" onChange={handleAvatarChange} className="file:text-primary file:font-medium" />
                             <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Recomendado 200x200px.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name-dialog">Nome Completo</Label>
                        <Input id="name-dialog" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email-dialog">Email</Label>
                        <Input id="email-dialog" value={userData?.email || ''} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role-dialog">Cargo</Label>
                        <Input id="role-dialog" value={formatRoleName(userData?.role || '')} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signature-upload">Assinatura Digital</Label>
                        <div className="p-4 border rounded-md flex justify-center items-center bg-muted/30 h-32">
                            {signatureUrl ? (
                                <img src={signatureUrl} alt="Signature Preview" className="max-h-full object-contain" />
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhuma assinatura enviada.</p>
                            )}
                        </div>
                        <Input id="signature-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleSignatureChange} className="mt-2 file:text-primary file:font-medium" />
                        <p className="text-xs text-muted-foreground">Envie uma imagem da sua assinatura (PNG com fundo transparente é recomendado).</p>
                    </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChanges} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
