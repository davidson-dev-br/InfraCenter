"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, PlusCircle } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { ConnectionsTable } from "@/components/dashboard/connections/connections-table";
import { ConnectionDialog } from '@/components/dashboard/connections/connection-dialog';
import { IAConnectionDialog } from '@/components/dashboard/connections/ia-connection-dialog';

export default function ConnectionsPage() {
  const { connections } = useInfra();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Gerenciamento de Conexões</CardTitle>
              <CardDescription>Visualize e gerencie as conexões físicas entre seus equipamentos.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <IAConnectionDialog>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar com Etiqueta (IA)
                </Button>
              </IAConnectionDialog>
              <ConnectionDialog>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar Conexão
                </Button>
              </ConnectionDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ConnectionsTable data={connections} />
        </CardContent>
      </Card>
    </div>
  );
}
