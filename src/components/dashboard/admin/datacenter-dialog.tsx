"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Datacenter } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type DatacenterDialogProps = {
    children: React.ReactNode;
    datacenter?: Datacenter;
}

export function DatacenterDialog({ children, datacenter }: DatacenterDialogProps) {
    const isEditMode = !!datacenter;
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd handle form submission to your API
        toast({
            title: `Datacenter ${isEditMode ? 'updated' : 'created'}`,
            description: `The datacenter "${datacenter?.name || 'New Datacenter'}" has been saved.`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Datacenter' : 'Create Datacenter'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? "Make changes to your datacenter here." : "Add a new datacenter to your infrastructure."} Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" defaultValue={datacenter?.name} className="col-span-3" required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="location" className="text-right">
                                Location
                            </Label>
                            <Input id="location" defaultValue={datacenter?.location} className="col-span-3" required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select defaultValue={datacenter?.status} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="Offline">Offline</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">Save changes</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
