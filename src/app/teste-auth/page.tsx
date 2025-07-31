
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TesteAuthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Teste de Permissões</h1>
      <Card>
        <CardHeader>
          <CardTitle>Área para Testes de Autenticação e Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página foi criada para verificar e testar o sistema de controle de acesso baseado em cargos e permissões.</p>
        </CardContent>
      </Card>
    </div>
  );
}
