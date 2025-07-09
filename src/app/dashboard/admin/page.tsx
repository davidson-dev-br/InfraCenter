"use client";

import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { useAuth } from "@/components/dashboard/auth-provider";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DatacenterDialog } from "@/components/dashboard/admin/datacenter-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatacentersTable } from "@/components/dashboard/admin/datacenters-table";

export default function AdminPage() {
  const { buildings, systemSettings } = useInfra();
  const { userData } = useAuth();

  const permissions = userData?.role ? systemSettings.rolePermissions[userData.role] : null;
  const canCreate = permissions?.canCreateDatacenters;

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
       <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Administração de Datacenters</CardTitle>
            <CardDescription>Gerencie sua infraestrutura de datacenters.</CardDescription>
          </div>
          {canCreate && (
            <DatacenterDialog>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Criar Datacenter
              </Button>
            </DatacenterDialog>
          )}
        </CardHeader>
        <CardContent>
          <DatacentersTable data={buildings} />
        </CardContent>
      </Card>
    </div>
  )
}
