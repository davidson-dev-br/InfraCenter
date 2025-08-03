
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAuth, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const formSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type FormData = z.infer<typeof formSchema>;

interface LinkAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  pendingCredential: any;
}

export function LinkAccountDialog({ isOpen, onOpenChange, email, pendingCredential }: LinkAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth(app);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
        if (!auth.currentUser) {
            // Se não há usuário logado, significa que precisamos primeiro logar com a conta existente
            const userCredential = await signInWithEmailAndPassword(auth, email, data.password);
            // E então, vincular a nova credencial (ex: Microsoft)
            await linkWithCredential(userCredential.user, pendingCredential);
        } else {
            // Se já há um usuário logado, ele está tentando adicionar um novo método de login.
            const credential = EmailAuthProvider.credential(email, data.password);
            await linkWithCredential(auth.currentUser, credential);
        }
      
      toast({
        title: "Contas Vinculadas!",
        description: "Agora você pode usar ambos os métodos para fazer login.",
      });
      onOpenChange(false);
      // O AuthProvider cuidará do redirecionamento após o login bem-sucedido.

    } catch (err: any) {
      console.error("Erro ao vincular contas:", err);
      if(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("A senha da sua conta existente está incorreta.");
      } else {
        setError("Ocorreu um erro ao tentar vincular as contas.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Contas</DialogTitle>
          <DialogDescription>
            Já existe uma conta associada ao e-mail <span className="font-bold">{email}</span>. Para conectar os dois métodos de login, por favor, insira a senha da sua conta existente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha da Conta Existente</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                Vincular Contas
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
