import { Datacenter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DatacenterDialog } from "@/components/dashboard/admin/datacenter-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Location</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((dc) => (
                            <TableRow key={dc.id}>
                                <TableCell className="font-medium">{dc.name}</TableCell>
                                <TableCell>{dc.location}</TableCell>
                                <TableCell>
                                    <Badge variant={dc.status === 'Online' ? 'default' : dc.status === 'Offline' ? 'destructive' : 'secondary'}
                                        className={cn(dc.status === 'Online' && 'bg-green-500 hover:bg-green-600', dc.status === 'Maintenance' && 'bg-amber-500 hover:bg-amber-600')}
                                    >
                                        {dc.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="w-8 h-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DatacenterDialog datacenter={dc}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                            </DatacenterDialog>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive cursor-pointer">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
