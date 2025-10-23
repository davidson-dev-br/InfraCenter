"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { UserDialog } from "@/components/dashboard/users/user-dialog";

export default function UsersPage() {
  const { users } = useInfra();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Gerenciamento de Usuários</CardTitle>
            <CardDescription>Adicione, edite ou remova usuários do sistema.</CardDescription>
          </div>
          <UserDialog>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </UserDialog>
        </CardHeader>
        <CardContent>
          <UsersTable data={users} />
        </CardContent>
      </Card>
    </div>
  );
}
