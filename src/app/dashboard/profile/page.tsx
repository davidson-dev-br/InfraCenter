
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const { userData } = useAuth();
    const { updateUser } = useInfra();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name);
            setAvatarUrl(userData.avatarUrl || null);
        }
    }, [userData]);

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

    const handleSaveChanges = async () => {
        if (!userData) return;
        setIsLoading(true);
        try {
            await updateUser({
                ...userData,
                name: name,
                avatarUrl: avatarUrl,
            });
            toast({ title: "Perfil Atualizado", description: "Suas informações foram salvas com sucesso."});
        } catch (error) {
            console.error("Failed to update profile", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o perfil."});
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-16 h-16 animate-spin" />
            </div>
        );
    }

    const formatRoleName = (role: string) => {
        if (!role) return '';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Meu Perfil</CardTitle>
                    <CardDescription>Atualize suas informações pessoais e avatar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                           <AvatarImage src={avatarUrl || ''} alt={name} />
                           <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                             <Label htmlFor="avatar-upload">Alterar Avatar</Label>
                             <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="file:text-primary file:font-medium" />
                             <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Recomendado 200x200px.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={userData.email} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Input id="role" value={formatRoleName(userData.role)} disabled />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveChanges} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
