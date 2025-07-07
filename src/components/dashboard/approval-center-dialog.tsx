"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { PlacedItem } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ApprovalCenterDialogProps = {
    children: React.ReactNode;
    items: PlacedItem[];
    onApproveItem: (itemId: string) => void;
}

export function ApprovalCenterDialog({ children, items, onApproveItem }: ApprovalCenterDialogProps) {
    const { toast } = useToast();
    const itemsAwaitingApproval = items.filter(item => item.awaitingApproval);
    const itemsAwaitingDeletion = items.filter(item => item.awaitingDeletion);

    const handleApprove = (item: PlacedItem) => {
        onApproveItem(item.id);
        toast({
            title: "Item Aprovado",
            description: `O item "${item.name}" foi aprovado com sucesso.`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Centro de Aprovações</DialogTitle>
                    <DialogDescription>
                        Aprove novos itens e gerencie solicitações de exclusão de ativos.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="initial" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="initial">
                            Aprovação Inicial ({itemsAwaitingApproval.length})
                        </TabsTrigger>
                        <TabsTrigger value="deletion">
                            Exclusão Pendente ({itemsAwaitingDeletion.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="initial" className="mt-4">
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome do Item</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Criado por</TableHead>
                                        <TableHead>Data Criação</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsAwaitingApproval.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                Nenhum item aguardando aprovação.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                      itemsAwaitingApproval.map(item => (
                                          <TableRow key={item.id}>
                                              <TableCell className="font-medium">{item.name}</TableCell>
                                              <TableCell>{item.type}</TableCell>
                                              <TableCell>{item.createdBy}</TableCell>
                                              <TableCell>{item.createdAt}</TableCell>
                                              <TableCell className="text-right">
                                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item)}>
                                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                                      Aprovar
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="deletion" className="mt-4">
                        <div className="border rounded-lg">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome do Item</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Solicitado por</TableHead>
                                        <TableHead>Data Solicitação</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Nenhum item aguardando exclusão.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
