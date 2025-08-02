
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cable, ArrowRight } from "lucide-react";
import { getAllConnections, ConnectionDetail } from "@/lib/connection-actions";

// Aqui é onde o spaghetti de cabos se transforma em uma lasanha organizada.

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const connections: ConnectionDetail[] = await getAllConnections();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Conexões Estabelecidas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Conexões</CardTitle>
          <CardDescription>
            Visualize todas as conexões físicas (De/Para) ativas no seu inventário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem (A)</TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Destino (B)</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.length > 0 ? (
                connections.map(conn => (
                  <TableRow key={conn.id}>
                    <TableCell>
                      <div className="font-medium">{conn.itemA_label}</div>
                      <div className="text-sm text-muted-foreground">{conn.portA_label} ({conn.itemA_parentLabel})</div>
                    </TableCell>
                    <TableCell>
                       <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                     <TableCell>
                      <div className="font-medium">{conn.itemB_label}</div>
                      <div className="text-sm text-muted-foreground">{conn.portB_label} ({conn.itemB_parentLabel})</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{conn.connectionType}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="capitalize">{conn.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Cable className="h-12 w-12 text-muted-foreground/50" />
                        <p className="font-semibold text-muted-foreground">Nenhuma conexão encontrada.</p>
                        <p className="text-sm text-muted-foreground/80">
                         Use a página "De/Para" para criar novas conexões.
                        </p>
                    </div>
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
