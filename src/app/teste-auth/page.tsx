
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TestLoginForm } from "@/components/auth/test-login-form";

export default function TesteAuthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Teste de Unificação de Contas (Account Linking)</h1>
      <Card>
        <CardHeader>
          <CardTitle>Laboratório de Login</CardTitle>
          <CardDescription>
            Use o formulário abaixo para testar o fluxo de login e a vinculação de contas com diferentes provedores (Microsoft e E-mail/Senha) para o mesmo endereço de e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-sm">
             <TestLoginForm />
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert">
            <h4>Cenário de Teste (Usuário Novo):</h4>
            <ol>
                <li>Crie uma conta usando um método (ex: Microsoft com o e-mail <strong>teste@empresa.com</strong>).</li>
                <li>Faça logout.</li>
                <li>Tente criar uma conta com o <strong>mesmo e-mail</strong> (teste@empresa.com), mas usando o outro método (ex: E-mail/Senha).</li>
                <li>O sistema deve detectar a conta existente e apresentar um diálogo pedindo para vincular as contas.</li>
                <li>Após a vinculação, você poderá fazer login com qualquer um dos dois métodos e acessar a mesma conta de usuário.</li>
            </ol>
        </CardContent>
       </Card>
    </div>
  );
}
