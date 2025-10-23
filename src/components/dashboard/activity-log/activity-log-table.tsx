"use client";

import type { ActivityLogEntry } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type ActivityLogTableProps = {
  data: ActivityLogEntry[];
};

export function ActivityLogTable({ data }: ActivityLogTableProps) {

  const getActionVariant = (action: ActivityLogEntry['action']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (action) {
          case 'create':
              return 'default'; // Greenish in some themes
          case 'update':
          case 'move':
              return 'secondary'; // Bluish/Grayish
          case 'approve':
              return 'outline'; // Neutral
          case 'delete':
              return 'destructive'; // Red
          default:
              return 'secondary';
      }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
        return format(parseISO(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
    } catch (error) {
        return "Data inválida";
    }
  }

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Detalhes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Nenhuma atividade registrada neste datacenter.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-mono text-xs">{formatTimestamp(entry.timestamp)}</TableCell>
                            <TableCell className="font-medium">{entry.user}</TableCell>
                            <TableCell>
                                <Badge variant={getActionVariant(entry.action)} className="capitalize">{entry.action}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{entry.category}</Badge>
                            </TableCell>
                            <TableCell>{entry.details}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
  );
}
