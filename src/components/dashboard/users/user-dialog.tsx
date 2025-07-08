"use client";

import React, { useState, useEffect } from "react";
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
import type { User } from "@/lib/types";
import { useInfra } from "../datacenter-switcher";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const USER_ROLES: User['role'][] = ['technician', 'supervisor', 'manager', 'developer'];

// Helper to capitalize role names for display
const formatRoleName = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

type UserDialogProps = {
    children: React.ReactNode;
    user?: User;
}

export function UserDialog({ children, user }: UserDialogProps) {
    const { addUser, updateUser, buildings } = useInfra();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'technician' as User['role'],
        datacenterId: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    password: '', // Don't show existing password
                    role: user.role,
                    datacenterId: user.datacenterId || ''
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'technician' as User['role'],
                    datacenterId: buildings[0]?.id || ''
                });
            }
        }
    }, [isOpen, user, isEditMode, buildings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleSelectChange = (field: 'role' | 'datacenterId') => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && user) {
            updateUser({ ...user, ...formData });
        } else {
            if (!formData.password || !auth) {
                toast({ variant: 'destructive', title: 'Senha é obrigatória para novos usuários.' });
                return;
            }
            try {
                // 1. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const authUser = userCredential.user;

                // 2. Add user profile to Firestore with the same UID
                await addUser({ 
                    name: formData.name, 
                    email: formData.email, 
                    role: formData.role, 
                    datacenterId: formData.datacenterId,
                    avatarUrl: `https://placehold.co/40x40.png` 
                }, authUser.uid);
                
                toast({ title: "Usuário Criado", description: "Usuário criado na autenticação e no banco de dados."});
            } catch (error: any) {
                console.error("Error creating user:", error);
                const errorCode = error.code;
                let message = "Falha ao criar usuário.";
                if (errorCode === 'auth/email-already-in-use') {
                    message = "Este email já está em uso.";
                } else if (errorCode === 'auth/weak-password') {
                    message = "A senha deve ter pelo menos 6 caracteres.";
                }
                toast({ variant: 'destructive', title: 'Erro', description: message });
                return; // Stop execution
            }
        }
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? "Faça alterações no perfil do usuário." : "Preencha os dados para criar um novo usuário. A criação de usuários é de responsabilidade dos gerentes de projeto."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required disabled={isEditMode} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" required={!isEditMode} placeholder={isEditMode ? "Deixe em branco para não alterar" : ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo</Label>
                             <Select value={formData.role} onValueChange={handleSelectChange('role')} required>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Selecione um cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_ROLES.map(roleOption => (
                                        <SelectItem key={roleOption} value={roleOption}>{formatRoleName(roleOption)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role === 'technician' && (
                            <div className="space-y-2">
                                <Label htmlFor="datacenterId">Datacenter Atribuído</Label>
                                <Select value={formData.datacenterId} onValueChange={handleSelectChange('datacenterId')} required>
                                    <SelectTrigger id="datacenterId">
                                        <SelectValue placeholder="Selecione um datacenter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map(dc => (
                                            <SelectItem key={dc.id} value={dc.id}>{dc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
