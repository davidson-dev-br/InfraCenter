

import * as React from 'react';
import { getPendingApprovals, ApprovalRequest } from '@/lib/approval-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, X, Clock, User, HardDrive, Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResolveApprovalDialog } from '@/components/approvals/resolve-approval-dialog';

export const dynamic = 'force-dynamic';

function ApprovalItemCard({ request }: { request: ApprovalRequest }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {request.entityType === 'ParentItems' ? <Puzzle className="h-5 w-5"/> : <HardDrive className="h-5 w-5" />}
            {request.entityLabel}
          </CardTitle>
          <CardDescription>
            Solicitação para alterar o status do item de 
            <Badge variant="outline" className="mx-1.5">{request.details.from}</Badge> para <Badge variant="secondary" className="mx-1.5">{request.details.to}</Badge>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Solicitado por: <strong>{request.requestedByUserDisplayName}</strong></span>
          </div>
           <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>Em: {new Date(request.requestedAt).toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}><X className="mr-2 h-4 w-4"/> Rejeitar</Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}><Check className="mr-2 h-4 w-4"/> Aprovar</Button>
        </CardFooter>
      </Card>
      {isDialogOpen && (
        <ResolveApprovalDialog
          request={request}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  )
}

export default async function ApprovalsPage() {
  const pendingApprovals = await getPendingApprovals();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Aprovações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            Itens que requerem sua aprovação para se tornarem ativos ou mudarem de estado crítico no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApprovals.map(request => (
                <ApprovalItemCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
              <p className="text-sm text-muted-foreground/80">
                Quando uma alteração que exige aprovação for submetida, ela aparecerá aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
