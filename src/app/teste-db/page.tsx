
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMysqlTestConnection } from "@/lib/db";
import { CheckCircle, AlertCircle, Database, Server } from "lucide-react";

export const dynamic = 'force-dynamic';

async function runTest() {
  const { connection, error: connectionError } = await getMysqlTestConnection();

  if (connectionError) {
    return { success: false, message: connectionError, data: null };
  }

  if (!connection) {
     return { success: false, message: "A conexão não pôde ser estabelecida, mas nenhum erro foi retornado.", data: null };
  }

  try {
    const [rows] = await connection.execute('SELECT "Conexão com o MySQL bem-sucedida!" as message;');
    return { success: true, message: "Consulta executada com sucesso!", data: rows };
  } catch (queryError: any) {
    return { success: false, message: `Erro ao executar consulta: ${queryError.message}`, data: null };
  } finally {
      if (connection) {
          await connection.end();
      }
  }
}

export default async function TesteDbPage() {
  const result = await runTest();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Teste de Banco de Dados</h1>
      <Card>
        <CardHeader>
          <CardTitle>Laboratório de Conexão com MySQL</CardTitle>
          <CardDescription>
            Esta página tenta se conectar a um banco de dados MySQL local usando as credenciais do seu arquivo `.env`. A aplicação principal continua usando o Azure SQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.success ? (
            <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 [&>svg]:text-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>
                <p>A conexão com o banco de dados MySQL foi estabelecida e uma consulta foi executada com sucesso.</p>
                <pre className="mt-2 p-2 bg-black/10 rounded-md text-xs font-mono">
                    {JSON.stringify(result.data, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Falha na Conexão</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Não foi possível conectar ao banco de dados MySQL. Verifique os seguintes pontos:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Seu servidor MySQL local está em execução?</li>
                    <li>As variáveis de ambiente `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, e `MYSQL_DATABASE` estão definidas corretamente no seu arquivo `.env`?</li>
                    <li>O usuário do MySQL tem permissão para se conectar do host especificado?</li>
                </ul>
                <p className="mt-4 font-semibold">Mensagem de Erro:</p>
                <pre className="mt-1 p-2 bg-destructive/10 rounded-md text-xs font-mono">
                  {result.message}
                </pre>
              </AlertDescription>
            </Alert>
          )}

           <div className="grid grid-cols-2 gap-4 pt-4">
                <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Aplicação Principal</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-sky-500">Azure SQL</div>
                        <p className="text-xs text-muted-foreground">Conexão estável em produção.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Página de Teste</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-amber-500">MySQL Local</div>
                        <p className="text-xs text-muted-foreground">Ambiente isolado para desenvolvimento.</p>
                    </CardContent>
                </Card>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
