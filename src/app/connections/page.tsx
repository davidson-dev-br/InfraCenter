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

// Aqui é onde o spaghetti de cabos se transforma em uma lasanha organizada.

export default async function ConnectionsPage() {
  // Por enquanto, usaremos dados estáticos.
  // No futuro, esta função buscará os dados da tabela 'Connections'.
  const connections = [];

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
                // O mapeamento dos dados reais virá aqui no futuro
                <TableRow><TableCell>Exemplo</TableCell></TableRow>
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
