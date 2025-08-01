
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMysqlTestConnection, listAllTables } from "@/lib/debug-actions";
import { CheckCircle, AlertCircle, Database, Server, ListTree, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";

interface TableInfo {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
}

// Este componente agora é interativo para permitir a chamada da nova função.
export default function TesteDbPage() {
  const [mysqlResult, setMysqlResult] = useState<{ success: boolean; message: string; data: any } | null>(null);
  const [schemaResult, setSchemaResult] = useState<{ success: boolean; data: TableInfo[] | null; error: string | null } | null>(null);
  
  const [isMysqlPending, startMysqlTransition] = useTransition();
  const [isSchemaPending, startSchemaTransition] = useTransition();

  const handleRunMysqlTest = () => {
    startMysqlTransition(async () => {
      const result = await getMysqlTestConnection();
      setMysqlResult(result);
    });
  };
  
  const handleListTables = () => {
    startSchemaTransition(async () => {
        const result = await listAllTables();
        setSchemaResult(result);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Laboratório de Banco de Dados</h1>
      
      {/* Card para Teste de Conexão MySQL */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão com MySQL</CardTitle>
          <CardDescription>
            Use esta seção para testar a conexão com um banco de dados MySQL local. A aplicação principal continuará usando o Azure SQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleRunMysqlTest} disabled={isMysqlPending}>
            {isMysqlPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Testar Conexão MySQL
          </Button>
          {mysqlResult && (
            mysqlResult.success ? (
              <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 [&>svg]:text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription>
                  <p>A conexão com o banco de dados MySQL foi estabelecida e uma consulta foi executada com sucesso.</p>
                  <pre className="mt-2 p-2 bg-black/10 rounded-md text-xs font-mono">
                      {JSON.stringify(mysqlResult.data, null, 2)}
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
                  </ul>
                  <p className="mt-4 font-semibold">Mensagem de Erro:</p>
                  <pre className="mt-1 p-2 bg-destructive/10 rounded-md text-xs font-mono">
                    {mysqlResult.message}
                  </pre>
                </AlertDescription>
              </Alert>
            )
          )}
        </CardContent>
      </Card>
      
      {/* Novo Card para Listar Tabelas do Azure SQL */}
      <Card>
        <CardHeader>
          <CardTitle>Inspetor de Schema (Azure SQL)</CardTitle>
          <CardDescription>
            Clique no botão abaixo para listar todas as tabelas de usuário existentes no banco de dados principal da aplicação (Azure SQL).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleListTables} disabled={isSchemaPending}>
                {isSchemaPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListTree className="mr-2 h-4 w-4" />}
                Listar Tabelas
            </Button>

            {schemaResult && (
                schemaResult.success && schemaResult.data ? (
                    <div className="border rounded-md mt-4 max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted">
                                <TableRow>
                                    <TableHead>Schema</TableHead>
                                    <TableHead>Nome da Tabela</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schemaResult.data.map(table => (
                                    <TableRow key={`${table.TABLE_SCHEMA}.${table.TABLE_NAME}`}>
                                        <TableCell>{table.TABLE_SCHEMA}</TableCell>
                                        <TableCell className="font-mono">{table.TABLE_NAME}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Falha ao Listar Tabelas</AlertTitle>
                        <AlertDescription>
                            <p>Ocorreu um erro ao tentar buscar a lista de tabelas do Azure SQL.</p>
                            <p className="mt-4 font-semibold">Mensagem de Erro:</p>
                            <pre className="mt-1 p-2 bg-destructive/10 rounded-md text-xs font-mono">
                                {schemaResult.error}
                            </pre>
                        </AlertDescription>
                    </Alert>
                )
            )}
        </CardContent>
      </Card>

      <Separator />
      
       <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Banco de Dados Principal</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-sky-500">Azure SQL</div>
                    <p className="text-xs text-muted-foreground">Conexão estável para produção.</p>
                </CardContent>
            </Card>
             <Card className="bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Conexão de Teste</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-amber-500">MySQL Local</div>
                    <p className="text-xs text-muted-foreground">Ambiente isolado para desenvolvimento.</p>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}