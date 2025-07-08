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

const USER_ROLES: User['role'][] = ['Admin', 'Editor', 'Viewer'];

type UserDialogProps = {
    children: React.ReactNode;
    user?: User;
}

export function UserDialog({ children, user }: UserDialogProps) {
    const { addUser, updateUser } = useInfra();
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Viewer' as User['role'],
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    password: '', // Don't show existing password
                    role: user.role,
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'Viewer' as User['role'],
                });
            }
        }
    }, [isOpen, user, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleSelectChange = (value: User['role']) => {
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, role } = formData;
        
        if (isEditMode && user) {
            updateUser({ ...user, name, email, role });
        } else {
            // In a real app, password would be handled securely.
            // Here we're just passing it along conceptually.
            addUser({ name, email, role, avatarUrl: `https://placehold.co/40x40.png` });
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
                            {isEditMode ? "Faça alterações no perfil do usuário." : "Preencha os dados para criar um novo usuário."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" required={!isEditMode} placeholder={isEditMode ? "Deixe em branco para não alterar" : ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo</Label>
                             <Select value={formData.role} onValueChange={handleSelectChange} required>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Selecione um cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_ROLES.map(roleOption => (
                                        <SelectItem key={roleOption} value={roleOption}>{roleOption}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
