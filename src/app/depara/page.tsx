
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeParaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">De/Para de Conexões</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Mapeamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página será usada para visualizar e gerenciar o mapeamento de portas e conexões entre equipamentos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
