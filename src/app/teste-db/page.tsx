
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMysqlTestConnection, listAllTables } from "@/lib/debug-actions";
import { CheckCircle, AlertCircle, Database, Server, ListTree, Loader2, BrickWall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ColumnInfo {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  IS_NULLABLE: 'YES' | 'NO';
}

interface TableWithColumns {
    name: string;
    columns: ColumnInfo[];
}

// Este código foi feito com a mesma precisão de um cirurgião com parkinson. Use com moderação. By davidson.dev.br
export default function TesteDbPage() {
  const [mysqlResult, setMysqlResult] = useState<{ success: boolean; message: string; data: any } | null>(null);
  const [schemaResult, setSchemaResult] = useState<{ success: boolean; data: ColumnInfo[] | null; error: string | null } | null>(null);
  
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

  const tablesWithColumns = useMemo(() => {
    if (!schemaResult?.success || !schemaResult.data) {
      return [];
    }
    const tablesMap = new Map<string, TableWithColumns>();
    for (const column of schemaResult.data) {
      if (!tablesMap.has(column.TABLE_NAME)) {
        tablesMap.set(column.TABLE_NAME, { name: column.TABLE_NAME, columns: [] });
      }
      tablesMap.get(column.TABLE_NAME)!.columns.push(column);
    }
    return Array.from(tablesMap.values());
  }, [schemaResult]);


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Laboratório de Banco de Dados</h1>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle>Inspetor de Schema (Azure SQL)</CardTitle>
          <CardDescription>
            Clique no botão abaixo para listar todas as tabelas e suas colunas no banco de dados principal (Azure SQL).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleListTables} disabled={isSchemaPending}>
                {isSchemaPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListTree className="mr-2 h-4 w-4" />}
                Inspecionar Schema
            </Button>

            {schemaResult && (
                schemaResult.success && tablesWithColumns.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                       {tablesWithColumns.map(table => (
                        <AccordionItem value={table.name} key={table.name}>
                             <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <BrickWall className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-base">{table.name}</span>
                                    <Badge variant="outline">{table.columns.length} colunas</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="overflow-x-auto border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coluna</TableHead>
                                                <TableHead>Tipo de Dado</TableHead>
                                                <TableHead>Nulo?</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {table.columns.map(col => (
                                                <TableRow key={col.COLUMN_NAME}>
                                                    <TableCell className="font-mono">{col.COLUMN_NAME}</TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {col.DATA_TYPE}
                                                        {col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}
                                                    </TableCell>
                                                    <TableCell>{col.IS_NULLABLE === 'YES' ? 'Sim' : 'Não'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                       ))}
                    </Accordion>
                ) : schemaResult.error ? (
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
                ) : null
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
