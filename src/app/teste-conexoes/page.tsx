
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TesteConexoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Teste de Conexões</h1>
      <Card>
        <CardHeader>
          <CardTitle>Área para Testes de Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página foi criada para testar a funcionalidade de criação e visualização de conexões entre itens.</p>
        </CardContent>
      </Card>
    </div>
  );
}
