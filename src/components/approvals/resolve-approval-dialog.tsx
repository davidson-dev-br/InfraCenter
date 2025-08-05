
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { resolveApproval, ApprovalRequest } from '@/lib/approval-actions';
import { Badge } from '../ui/badge';
import { usePermissions } from '../permissions-provider';

const formSchema = z.object({
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ResolveApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  request: ApprovalRequest;
}

export function ResolveApprovalDialog({ 
  isOpen, 
  onOpenChange,
  request
}: ResolveApprovalDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = usePermissions();
    
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { notes: '' },
    });

    const handleResolve = async (decision: 'approved' | 'rejected') => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.'});
            return;
        }
        const notes = form.getValues('notes');
        try {
            await resolveApproval(request.id, decision, notes || null, user.id);
            toast({
                title: 'Sucesso!',
                description: `A solicitação para o item "${request.entityLabel}" foi ${decision === 'approved' ? 'aprovada' : 'rejeitada'}.`,
            });
            form.reset();
            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Erro ao processar',
                description: error.message,
            });
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Solicitação</DialogTitle>
          <DialogDescription>
            Aprovar ou rejeitar a mudança de status para o item <span className="font-bold">{request.entityLabel}</span> de <Badge variant="outline">{request.details.from}</Badge> para <Badge variant="secondary">{request.details.to}</Badge>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adicione uma justificativa ou observação..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="destructive" onClick={() => handleResolve('rejected')} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <X className="mr-2 h-4 w-4"/> Rejeitar
              </Button>
              <Button type="button" onClick={() => handleResolve('approved')} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Check className="mr-2 h-4 w-4"/> Aprovar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
