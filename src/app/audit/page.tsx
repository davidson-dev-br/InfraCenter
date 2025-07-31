
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getAuditLogs } from '@/lib/audit-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EyeOff, FileDiff } from 'lucide-react';

interface AuditLog {
    id: number;
    timestamp: string;
    userDisplayName: string;
    action: string;
    entityType: string;
    entityId: string;
    details: any;
}

const LogRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
    </TableRow>
)

const renderDetails = (details: any) => {
    if (!details) return 'N/A';
    if (details.new && details.old) {
        return (
             <div className="space-y-2">
                <div>
                    <h4 className="font-semibold text-xs text-muted-foreground">Antes</h4>
                    <pre className="mt-1 p-2 bg-red-500/10 rounded-md whitespace-pre-wrap font-mono text-xs">{JSON.stringify(details.old, null, 2)}</pre>
                </div>
                <div>
                    <h4 className="font-semibold text-xs text-muted-foreground">Depois</h4>
                    <pre className="mt-1 p-2 bg-green-500/10 rounded-md whitespace-pre-wrap font-mono text-xs">{JSON.stringify(details.new, null, 2)}</pre>
                </div>
            </div>
        )
    }
    return <pre className="mt-2 p-2 bg-muted/50 rounded-md whitespace-pre-wrap font-mono text-xs">{JSON.stringify(details, null, 2)}</pre>
}

export default function AuditPage() {
    const [auditLogEnabled] = useLocalStorage('dev_auditLogEnabled', false);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (auditLogEnabled) {
            setIsLoading(true);
            getAuditLogs().then(data => {
                setLogs(data);
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            setLogs([]);
        }
    }, [auditLogEnabled]);

    if (!auditLogEnabled) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold font-headline">Auditoria</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Log de Auditoria</CardTitle>
                        <CardDescription>
                            Acompanhe todas as ações importantes realizadas no sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center">
                            <EyeOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-semibold">O Log de Auditoria está desativado.</p>
                            <p className="text-sm text-muted-foreground/80">
                                Ative-o no menu de desenvolvedor para começar a registrar e visualizar as ações.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
  
    return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Auditoria</h1>
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
           <CardDescription>
            Acompanhe todas as ações importantes realizadas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Quem</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <>
                        <LogRowSkeleton />
                        <LogRowSkeleton />
                        <LogRowSkeleton />
                    </>
                ) : logs.length > 0 ? (
                    logs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{log.userDisplayName}</TableCell>
                            <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                            <TableCell>
                                <p className="font-mono text-xs text-muted-foreground">
                                    {log.entityType && <span className="mr-2">Tipo: {log.entityType}</span>}
                                    {log.entityId && <span>ID: {log.entityId}</span>}
                                </p>
                                {renderDetails(log.details)}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum registro de auditoria encontrado.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
