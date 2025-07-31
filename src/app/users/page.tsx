
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/lib/user-actions";
import type { User } from "@/lib/user-service";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ManageUserButton } from "@/components/manage-user-button";
import { AddUserDialog } from "@/components/add-user-dialog";
import type { UserRole } from "@/components/permissions-provider";

export const dynamic = 'force-dynamic';

// Mapeia os identificadores de função para rótulos amigáveis em português.
const roleLabels: Record<UserRole, string> = {
  developer: 'Desenvolvedor',
  manager: 'Gerente',
  project_manager: 'Gerente de Projeto',
  supervisor_1: 'Supervisor 1',
  supervisor_2: 'Supervisor 2',
  technician_1: 'Técnico 1',
  technician_2: 'Técnico 2',
  guest: 'Convidado',
};

// Mapeia as funções para classes de estilo Tailwind, para colorir os badges.
const roleStyles: Record<UserRole, string> = {
  developer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manager: "bg-red-500/20 text-red-400 border-red-500/30",
  project_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  supervisor_1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  supervisor_2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  technician_1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  technician_2: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  guest: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// Função auxiliar para obter as iniciais de um nome para o avatar de fallback.
const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'; // Retorna 'U' para 'Usuário' se não houver nome.
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


// Esta é uma Página de Servidor (Server Component).
// Ela é renderizada no servidor e pode buscar dados diretamente (ex: `await getUsers()`).
export default async function UsersPage() {
  // Busca os usuários diretamente do banco de dados.
  const users = await getUsers();
  
  // Esta parte não é ideal em produção, mas para o ambiente de dev é ok.
  // Deveria haver uma forma de obter o usuário logado no servidor de forma mais direta.
  // const { user: loggedInUser } = usePermissions(); // Isso não funciona em Server Component.

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Usuários</h1>
        <AddUserDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mapeia a lista de usuários para criar uma linha na tabela para cada um. */}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <Avatar className="h-9 w-9">
                          {/* Usa a foto do usuário ou um fallback com as iniciais. */}
                          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.displayName || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                   <TableCell>
                    {/* Exibe o cargo do usuário com um badge colorido. */}
                    <Badge variant="outline" className={cn("capitalize", roleStyles[user.role])}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  {/* Formata a data do último login para uma leitura mais fácil. */}
                  <TableCell>{new Date(user.lastLoginAt).toLocaleString()}</TableCell>
                   <TableCell className="text-right">
                    <ManageUserButton user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
