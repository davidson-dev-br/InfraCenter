
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, PlusCircle, AlertTriangle } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { ConnectionsTable } from "@/components/dashboard/connections/connections-table";
import { ConnectionDialog } from '@/components/dashboard/connections/connection-dialog';
import { IAConnectionDialog } from '@/components/dashboard/connections/ia-connection-dialog';
import { AlertCenterDialog } from '@/components/dashboard/connections/alert-center-dialog';
import { Badge } from '@/components/ui/badge';
import type { Connection } from '@/lib/types';

export default function ConnectionsPage() {
  const { connections } = useInfra();
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);

  const connectionsWithAlerts = connections.filter(c => c.alert);

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setIsConnectionDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setEditingConnection(null);
    setIsConnectionDialogOpen(false);
  }

  return (
    <>
      <div className="container p-4 mx-auto my-8 sm:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-headline">Gerenciamento de Conexões</CardTitle>
                <CardDescription>Visualize e gerencie as conexões físicas entre seus equipamentos.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 {connectionsWithAlerts.length > 0 && (
                   <AlertCenterDialog connections={connectionsWithAlerts} onEditConnection={handleEditConnection}>
                    <Button variant="destructive">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Central de Alertas
                      <Badge variant="secondary" className="ml-2">{connectionsWithAlerts.length}</Badge>
                    </Button>
                  </AlertCenterDialog>
                )}
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
            <ConnectionsTable data={connections} onEdit={handleEditConnection} />
          </CardContent>
        </Card>
      </div>
      
      {editingConnection && (
        <ConnectionDialog 
          connection={editingConnection}
          open={isConnectionDialogOpen}
          onOpenChange={handleDialogClose}
        />
      )}
    </>
  );
}
