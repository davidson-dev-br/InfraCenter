import { Datacenter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DatacenterDialog } from "@/components/dashboard/admin/datacenter-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatacentersTable } from "@/components/dashboard/admin/datacenters-table";

async function getData(): Promise<Datacenter[]> {
  // In a real app, you would fetch this data from an API
  return [
    { id: "dc-1", name: "US-East-1", location: "N. Virginia, USA", status: "Online" },
    { id: "dc-2", name: "EU-West-2", location: "London, UK", status: "Online" },
    { id: "dc-3", name: "AP-South-1", location: "Mumbai, India", status: "Maintenance" },
    { id: "dc-4", name: "US-West-2", location: "Oregon, USA", status: "Offline" },
  ]
}

export default async function AdminPage() {
  const data = await getData();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
       <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Datacenter Administration</CardTitle>
            <CardDescription>Manage your datacenter infrastructure.</CardDescription>
          </div>
          <DatacenterDialog>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Datacenter
            </Button>
          </DatacenterDialog>
        </CardHeader>
        <CardContent>
          <DatacentersTable data={data} />
        </CardContent>
      </Card>
    </div>
  )
}
